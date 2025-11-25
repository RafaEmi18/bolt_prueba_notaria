import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const { Pool } = pg;

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'notaria_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
});

// Test database connection
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  console.log(`✓ Serving static files from: ${distPath}`);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Obtener todos los servicios
app.get('/api/services', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services ORDER BY display_order ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// Obtener posts del blog publicados
app.get('/api/blog-posts', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await pool.query(
      `SELECT * FROM blog_posts 
       WHERE published = true 
       ORDER BY published_at DESC 
       LIMIT $1`,
      [limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Error al obtener posts del blog' });
  }
});

// Crear una solicitud de contacto
app.post('/api/contact-requests', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO contact_requests (name, email, phone, subject, message) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [name, email, phone || null, subject, message]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating contact request:', error);
    res.status(500).json({ error: 'Error al crear solicitud de contacto' });
  }
});

// Obtener todas las solicitudes de contacto (para administración)
app.get('/api/contact-requests', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contact_requests ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes de contacto' });
  }
});

// ==================== CHATBOT ENDPOINTS ====================

// Requisitos por servicio
const SERVICE_REQUIREMENTS = {
  compra_venta: [
    'Escritura',
    'Boleta de predial Actualizada',
    'Copia de INE Vigente',
    'Copia de CURP',
    'Copia de Acta de Nacimiento',
    'Copia de Constancia de Situación Fiscal',
    'Copia de Acta de Matrimonio'
  ],
  donacion: [
    'Escritura',
    'Boleta Predial actualizada',
    'Copia de INE',
    'Copia de CURP',
    'Copia de constancia de situación fiscal',
    'Copia de Acta de matrimonio'
  ],
  poder_general: [
    'Copia de INE',
    'Copia de CURP',
    'Copia Acta de nacimiento',
    'Copia constancia de situación fiscal'
  ]
};

// Iniciar o obtener conversación
app.post('/api/chatbot/conversation', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId es requerido' });
    }

    // Buscar conversación existente
    let result = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1',
      [sessionId]
    );

    let conversation;
    if (result.rows.length === 0) {
      // Crear nueva conversación
      result = await pool.query(
        `INSERT INTO chatbot_conversations (session_id, status, current_step) 
         VALUES ($1, 'active', 'welcome') 
         RETURNING *`,
        [sessionId]
      );
      conversation = result.rows[0];
    } else {
      conversation = result.rows[0];
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error creating/fetching conversation:', error);
    res.status(500).json({ error: 'Error al crear/obtener conversación' });
  }
});

// Obtener mensajes de una conversación
app.get('/api/chatbot/conversation/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Obtener conversación
    const convResult = await pool.query(
      'SELECT id FROM chatbot_conversations WHERE session_id = $1',
      [sessionId]
    );

    if (convResult.rows.length === 0) {
      return res.json([]);
    }

    const conversationId = convResult.rows[0].id;

    // Obtener mensajes
    const messagesResult = await pool.query(
      `SELECT * FROM chatbot_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );

    res.json(messagesResult.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Enviar mensaje y procesar respuesta del bot
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { sessionId, message, messageType = 'text', metadata = {} } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId y message son requeridos' });
    }

    // Validar que el mensaje no esté vacío después de eliminar espacios
    if (typeof message === 'string' && message.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    // Obtener o crear conversación
    let convResult = await pool.query(
      'SELECT * FROM chatbot_conversations WHERE session_id = $1',
      [sessionId]
    );

    let conversation;
    let wasRestarted = false;
    if (convResult.rows.length === 0) {
      convResult = await pool.query(
        `INSERT INTO chatbot_conversations (session_id, status, current_step) 
         VALUES ($1, 'active', 'welcome') 
         RETURNING *`,
        [sessionId]
      );
      conversation = convResult.rows[0];
    } else {
      conversation = convResult.rows[0];
      
      // Si la conversación está completada, reiniciarla completamente
      // NOTA: No borrar los mensajes anteriores, solo reiniciamos el estado de la conversación
      // Los mensajes se mantienen en la DB para historial, pero el frontend mostrará solo la nueva conversación
      if (conversation.status === 'completed' || conversation.current_step === 'completed') {
        // Reiniciar la conversación (solo el estado, NO los mensajes)
        await pool.query(
          `UPDATE chatbot_conversations 
           SET status = 'active', current_step = 'welcome', selected_service = NULL, updated_at = now() 
           WHERE id = $1`,
          [conversation.id]
        );
        conversation.status = 'active';
        conversation.current_step = 'welcome';
        conversation.selected_service = null;
        wasRestarted = true;
      }
    }

    const conversationId = conversation.id;

    // Guardar mensaje del usuario (siempre se guarda, incluso si la conversación se reinició)
    // Los mensajes se mantienen en la DB para historial completo
    await pool.query(
      `INSERT INTO chatbot_messages (conversation_id, sender, message, message_type, metadata) 
       VALUES ($1, 'user', $2, $3, $4)`,
      [conversationId, message, messageType, JSON.stringify(metadata)]
    );

    // Procesar respuesta del bot según el paso actual
    let botResponse = '';
    let botMessageType = 'text';
    let botMetadata = {};
    let nextStep = conversation.current_step;
    let selectedService = conversation.selected_service;

    // Si se reinició la conversación, tratarla como nueva (bienvenida)
    if (wasRestarted) {
      botResponse = '¡Hola! Bienvenido a nuestra notaría. Estoy aquí para ayudarte. ¿Qué servicio te interesa?\n\n1. Compra Venta\n2. Donación\n3. Poder General';
      botMessageType = 'service_selection';
      nextStep = 'service_selection';
      selectedService = null;
      // Actualizar la conversación en la base de datos inmediatamente después del reinicio
      await pool.query(
        `UPDATE chatbot_conversations 
         SET current_step = $1, selected_service = NULL, updated_at = now() 
         WHERE id = $2`,
        [nextStep, conversationId]
      );
      conversation.current_step = nextStep;
      conversation.selected_service = null;
    } else if (conversation.current_step === 'welcome') {
      botResponse = '¡Hola! Bienvenido a nuestra notaría. Estoy aquí para ayudarte. ¿Qué servicio te interesa?\n\n1. Compra Venta\n2. Donación\n3. Poder General';
      botMessageType = 'service_selection';
      nextStep = 'service_selection';
    } else if (conversation.current_step === 'service_selection') {
      const serviceMap = {
        '1': 'compra_venta',
        '2': 'donacion',
        '3': 'poder_general',
        'compra venta': 'compra_venta',
        'compra-venta': 'compra_venta',
        'donacion': 'donacion',
        'donación': 'donacion',
        'poder general': 'poder_general',
        'poder': 'poder_general'
      };

      const messageLower = message.toLowerCase().trim();
      selectedService = serviceMap[messageLower] || serviceMap[message];

      if (selectedService) {
        // Actualizar conversación con servicio seleccionado
        await pool.query(
          `UPDATE chatbot_conversations 
           SET selected_service = $1, current_step = 'requirements' 
           WHERE id = $2`,
          [selectedService, conversationId]
        );

        const requirements = SERVICE_REQUIREMENTS[selectedService];
        const serviceNames = {
          compra_venta: 'Compra Venta',
          donacion: 'Donación',
          poder_general: 'Poder General'
        };

        botResponse = `Has seleccionado: **${serviceNames[selectedService]}**\n\n **Requisitos necesarios:**\n\n${requirements.map((req, idx) => `${idx + 1}. ${req}`).join('\n')}\n\n¿Deseas continuar con el proceso? Responde "sí" para llenar el formulario con tus datos.`;
        botMessageType = 'requirements';
        botMetadata = { service: selectedService, requirements };
        nextStep = 'waiting_confirmation';
      } else {
        botResponse = 'Por favor, selecciona una opción válida:\n\n1. Compra Venta\n2. Donación\n3. Poder General';
        botMessageType = 'service_selection';
      }
    } else if (conversation.current_step === 'waiting_confirmation') {
      const messageLower = message.toLowerCase().trim();
      if (messageLower === 'sí' || messageLower === 'si' || messageLower === 'yes' || messageLower === 'continuar' || messageLower === 's') {
        botResponse = 'Perfecto. Por favor, completa el formulario con tus datos.';
        botMessageType = 'form';
        nextStep = 'collecting_data';
      } else if (messageLower === 'no' || messageLower === 'n') {
        botResponse = 'Entendido. Si cambias de opinión, puedes escribirme en cualquier momento. ¿Hay algo más en lo que pueda ayudarte?';
        nextStep = 'service_selection';
        selectedService = null;
        await pool.query(
          `UPDATE chatbot_conversations 
           SET selected_service = NULL 
           WHERE id = $1`,
          [conversationId]
        );
      } else {
        botResponse = 'Por favor, responde "sí" si deseas continuar con el formulario, o "no" si prefieres cancelar.';
        nextStep = 'waiting_confirmation';
      }
    } else if (conversation.current_step === 'collecting_data') {
      // Si el usuario escribe algo mientras está en collecting_data, recordarle que use el formulario
      botResponse = 'Por favor, completa el formulario que aparece abajo con tus datos. Si tienes alguna pregunta, puedes escribirla y te ayudaré.';
      nextStep = 'collecting_data';
    }

    // Si por alguna razón no se estableció una respuesta, usar una respuesta por defecto
    if (!botResponse || botResponse.trim().length === 0) {
      botResponse = '¡Hola! Bienvenido a nuestra notaría. Estoy aquí para ayudarte. ¿Qué servicio te interesa?\n\n1. Compra Venta\n2. Donación\n3. Poder General';
      botMessageType = 'service_selection';
      nextStep = 'service_selection';
      // Actualizar la conversación para asegurarnos de que esté en el paso correcto
      await pool.query(
        `UPDATE chatbot_conversations 
         SET current_step = $1, selected_service = NULL, updated_at = now() 
         WHERE id = $2`,
        [nextStep, conversationId]
      );
      conversation.current_step = nextStep;
      conversation.selected_service = null;
    }

    // Guardar respuesta del bot
    const botMessageResult = await pool.query(
      `INSERT INTO chatbot_messages (conversation_id, sender, message, message_type, metadata) 
       VALUES ($1, 'bot', $2, $3, $4) 
       RETURNING *`,
      [conversationId, botResponse, botMessageType, JSON.stringify(botMetadata)]
    );

    // Actualizar paso actual si cambió
    if (nextStep !== conversation.current_step || selectedService !== conversation.selected_service) {
      await pool.query(
        `UPDATE chatbot_conversations 
         SET current_step = $1, selected_service = $2, updated_at = now() 
         WHERE id = $3`,
        [nextStep, selectedService || conversation.selected_service, conversationId]
      );
    }

    res.json({
      botMessage: botMessageResult.rows[0],
      conversation: {
        ...conversation,
        current_step: nextStep,
        selected_service: selectedService || conversation.selected_service
      },
      restarted: wasRestarted
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

// Guardar solicitud de servicio
app.post('/api/chatbot/service-request', async (req, res) => {
  try {
    const { sessionId, serviceType, clientName, nationality, birthPlace, residence, phone } = req.body;

    if (!sessionId || !serviceType || !clientName || !nationality || !birthPlace || !residence || !phone) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar tipo de servicio
    if (!['compra_venta', 'donacion', 'poder_general'].includes(serviceType)) {
      return res.status(400).json({ error: 'Tipo de servicio inválido' });
    }

    // Obtener conversación
    const convResult = await pool.query(
      'SELECT id FROM chatbot_conversations WHERE session_id = $1',
      [sessionId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const conversationId = convResult.rows[0].id;

    // Crear solicitud de servicio
    const result = await pool.query(
      `INSERT INTO chatbot_service_requests 
       (conversation_id, service_type, client_name, nationality, birth_place, residence, phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [conversationId, serviceType, clientName, nationality, birthPlace, residence, phone]
    );

    // Actualizar conversación
    await pool.query(
      `UPDATE chatbot_conversations 
       SET current_step = 'completed', status = 'completed', updated_at = now() 
       WHERE id = $1`,
      [conversationId]
    );

    // Guardar mensaje de confirmación
    const serviceNames = {
      compra_venta: 'Compra Venta',
      donacion: 'Donación',
      poder_general: 'Poder General'
    };

    await pool.query(
      `INSERT INTO chatbot_messages (conversation_id, sender, message, message_type, metadata) 
       VALUES ($1, 'bot', $2, 'confirmation', $3)`,
      [
        conversationId,
        ` **Solicitud registrada exitosamente**\n\nServicio: ${serviceNames[serviceType]}\nNombre: ${clientName}\n\nNos pondremos en contacto contigo pronto. ¡Gracias por confiar en nosotros!`,
        JSON.stringify({ serviceRequestId: result.rows[0].id })
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ error: 'Error al crear solicitud de servicio' });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME || 'notaria_db'}@${process.env.DB_HOST || 'localhost'}`);
  console.log('='.repeat(50));
});

