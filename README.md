# Proyecto Notaría - Sistema Web Completo

Sistema web completo para notaría que incluye sitio informativo y chatbot inteligente para solicitudes de servicio.

## Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** - Build tool ultrarrápido
- **TailwindCSS** - Estilos modernos
- **Lucide React** - Iconos

### Backend
- **Node.js** con Express
- **PostgreSQL** - Base de datos relacional
- **CORS** - Configuración de seguridad

## Características

### Sitio Web
- Página principal con información de servicios
- Blog de noticias
- Formulario de contacto
- Diseño responsive

### Chatbot Inteligente
El chatbot permite a los clientes:
1. Consultar información sobre servicios notariales
2. Ver requisitos específicos por servicio
3. Solicitar citas completando un formulario
4. Guardar solicitudes en la base de datos

#### Servicios Disponibles
1. **Compra Venta**
2. **Donación**
3. **Poder General**

## Instalación Local

### Prerequisitos
- Node.js 18 o superior
- PostgreSQL 15 o superior
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd bolt_prueba_notaria
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar base de datos
```bash
# Crear base de datos
createdb notaria_db

# Ejecutar script de inicialización
psql -U postgres -d notaria_db -f database/chatbot_tables.sql
```

### 4. Configurar variables de entorno
Crear archivo `.env` en la raíz:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notaria_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña
PORT=3001
NODE_ENV=development
```

### 5. Ejecutar en desarrollo
```bash
# Opción 1: Ejecutar todo junto
npm run dev:all

# Opción 2: Ejecutar por separado
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:server
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Docker

### Ejecutar con Docker Compose (Recomendado)

```bash
# Construir y levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

La aplicación estará disponible en: http://localhost:3001

### Construir imagen Docker manualmente

```bash
# Construir imagen
docker build -t notaria-app .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env notaria-app
```

## Base de Datos

### Estructura de Tablas

#### Tablas Principales
- `services` - Servicios ofrecidos por la notaría
- `blog_posts` - Artículos del blog
- `contact_requests` - Solicitudes de contacto

#### Tablas del Chatbot
- `chatbot_conversations` - Sesiones de conversación
- `chatbot_messages` - Mensajes individuales
- `chatbot_service_requests` - Solicitudes de servicio completadas

### Consultas Útiles

```sql
-- Ver todas las solicitudes de servicio
SELECT * FROM chatbot_service_requests ORDER BY created_at DESC;

-- Ver conversaciones activas
SELECT * FROM chatbot_conversations WHERE status = 'active';

-- Estadísticas de servicios solicitados
SELECT service_type, COUNT(*) as total 
FROM chatbot_service_requests 
GROUP BY service_type;
```

## Despliegue en Google Cloud Platform

Para instrucciones detalladas de despliegue en GCP, consulta la documentación en:
[docs/GCP_DEPLOYMENT.md](docs/GCP_DEPLOYMENT.md)

### Opciones de Despliegue
1. **Cloud Run** - Recomendado para comenzar (serverless)
2. **Google Kubernetes Engine (GKE)** - Para mayor control y escalabilidad

## Estructura del Proyecto

```
bolt_prueba_notaria/
├── src/                    # Código fuente del frontend
│   ├── components/         # Componentes React
│   ├── lib/               # Utilidades
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Punto de entrada
├── server/                # Código del backend
│   └── index.js           # Servidor Express
├── database/              # Scripts SQL
│   ├── chatbot_tables.sql # Tablas del chatbot
│   └── init.sql           # Script de inicialización completo
├── public/                # Archivos estáticos
├── docs/                  # Documentación adicional
├── Dockerfile             # Configuración Docker
├── docker-compose.yml     # Orquestación de servicios
└── package.json           # Dependencias del proyecto
```

## Scripts Disponibles

```bash
npm run dev              # Ejecutar frontend en desarrollo
npm run dev:server       # Ejecutar backend en desarrollo
npm run dev:all          # Ejecutar frontend y backend simultáneamente
npm run build            # Compilar frontend para producción
npm run preview          # Previsualizar build de producción
npm run lint             # Ejecutar linter
npm run typecheck        # Verificar tipos de TypeScript
```

## API Endpoints

### Chatbot
- `POST /api/chatbot/conversation` - Iniciar/obtener conversación
- `GET /api/chatbot/conversation/:sessionId/messages` - Obtener mensajes
- `POST /api/chatbot/message` - Enviar mensaje
- `POST /api/chatbot/service-request` - Guardar solicitud de servicio

### Servicios
- `GET /api/services` - Obtener todos los servicios
- `GET /api/blog-posts` - Obtener posts del blog
- `POST /api/contact-requests` - Crear solicitud de contacto
- `GET /api/contact-requests` - Obtener todas las solicitudes

### Health Check
- `GET /health` - Verificar estado del servidor

## Requisitos por Servicio

### Compra Venta
1. Escritura
2. Boleta de predial Actualizada
3. Copia de INE Vigente
4. Copia de CURP
5. Copia de Acta de Nacimiento
6. Copia de Constancia de Situación Fiscal
7. Copia de Acta de Matrimonio

### Donación
1. Escritura
2. Boleta Predial actualizada
3. Copia de INE
4. Copia de CURP
5. Copia de constancia de situación fiscal
6. Copia de Acta de matrimonio

### Poder General
1. Copia de INE
2. Copia de CURP
3. Copia Acta de nacimiento
4. Copia constancia de situación fiscal

## Seguridad

- Variables de entorno para credenciales sensibles
- CORS configurado apropiadamente
- Validación de datos en el backend
- Prepared statements para prevenir SQL injection

## Licencia

Este proyecto es privado y confidencial.

## Soporte

Para soporte o preguntas, contacta al equipo de desarrollo.
