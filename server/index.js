import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const { Pool } = pg;

// Configuración de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'notaria_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Middleware
app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

