# Chatbot de Notaría - Guía de Instalación

## Descripción

Este chatbot permite a los clientes consultar información sobre servicios notariales y solicitar citas. Los datos se guardan en PostgreSQL.

## Servicios Disponibles

1. **Compra Venta**
2. **Donación**
3. **Poder General**

## Configuración de la Base de Datos

### 1. Ejecutar el script SQL

Ejecuta el script `database/chatbot_tables.sql` en tu base de datos PostgreSQL:

```bash
psql -U postgres -d notaria_db -f database/chatbot_tables.sql
```

O desde psql:

```sql
\i database/chatbot_tables.sql
```

### 2. Verificar las tablas creadas

Las siguientes tablas deberían haberse creado:

- `chatbot_conversations` - Almacena las conversaciones
- `chatbot_messages` - Almacena los mensajes individuales
- `chatbot_service_requests` - Almacena las solicitudes de servicio completadas

## Configuración del Servidor

Asegúrate de tener un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notaria_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=3001
```

## Ejecutar el Proyecto

### Desarrollo

1. Iniciar el servidor backend:
```bash
npm run dev:server
```

2. En otra terminal, iniciar el frontend:
```bash
npm run dev
```

O ejecutar ambos simultáneamente:
```bash
npm run dev:all
```

## Funcionalidades del Chatbot

### Flujo de Conversación

1. **Bienvenida**: El bot saluda y presenta los servicios disponibles
2. **Selección de Servicio**: El usuario elige uno de los 3 servicios
3. **Mostrar Requisitos**: El bot muestra los requisitos específicos del servicio seleccionado
4. **Formulario**: El usuario completa un formulario con:
   - Nombre completo
   - Nacionalidad
   - Lugar de nacimiento
   - Lugar de residencia
   - Número de teléfono
5. **Confirmación**: Se guarda la solicitud y se muestra un mensaje de confirmación

### Requisitos por Servicio

#### Compra Venta
1. Escritura
2. Boleta de predial Actualizada
3. Copia de INE Vigente
4. Copia de CURP
5. Copia de Acta de Nacimiento
6. Copia de Constancia de Situación Fiscal
7. Copia de Acta de Matrimonio

#### Donación
1. Escritura
2. Boleta Predial actualizada
3. Copia de INE
4. Copia de CURP
5. Copia de constancia de situación fiscal
6. Copia de Acta de matrimonio

#### Poder General
1. Copia de INE
2. Copia de CURP
3. Copia Acta de nacimiento
4. Copia constancia de situación fiscal

## Endpoints del API

### POST `/api/chatbot/conversation`
Inicia o obtiene una conversación existente.

**Body:**
```json
{
  "sessionId": "session_123456"
}
```

### GET `/api/chatbot/conversation/:sessionId/messages`
Obtiene todos los mensajes de una conversación.

### POST `/api/chatbot/message`
Envía un mensaje y recibe la respuesta del bot.

**Body:**
```json
{
  "sessionId": "session_123456",
  "message": "Hola",
  "messageType": "text"
}
```

### POST `/api/chatbot/service-request`
Guarda una solicitud de servicio completada.

**Body:**
```json
{
  "sessionId": "session_123456",
  "serviceType": "compra_venta",
  "clientName": "Juan Pérez",
  "nationality": "Mexicana",
  "birthPlace": "Ciudad de México",
  "residence": "Ciudad de México",
  "phone": "5551234567"
}
```

## Consultas Útiles

### Ver todas las solicitudes de servicio
```sql
SELECT * FROM chatbot_service_requests ORDER BY created_at DESC;
```

### Ver conversaciones activas
```sql
SELECT * FROM chatbot_conversations WHERE status = 'active';
```

### Ver mensajes de una conversación
```sql
SELECT * FROM chatbot_messages 
WHERE conversation_id = 'uuid-aqui' 
ORDER BY created_at ASC;
```

### Ver estadísticas de servicios solicitados
```sql
SELECT service_type, COUNT(*) as total 
FROM chatbot_service_requests 
GROUP BY service_type;
```

## Notas

- El `sessionId` se almacena en `localStorage` del navegador
- Cada conversación mantiene su historial de mensajes
- Las solicitudes de servicio se guardan con estado 'pending' por defecto
- El chatbot está diseñado para ser responsive y funcionar en dispositivos móviles

