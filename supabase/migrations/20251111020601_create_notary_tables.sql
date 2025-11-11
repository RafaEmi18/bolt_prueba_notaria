/*
  # Create Notary Public Website Database Schema

  ## Overview
  Creates tables for a professional notary public website including services, 
  blog posts, and contact form submissions.

  ## New Tables

  ### `services`
  Stores notary services offered
  - `id` (uuid, primary key)
  - `title` (text) - Service name
  - `description` (text) - Service description
  - `icon_name` (text) - Lucide icon name
  - `display_order` (integer) - Order to display services
  - `created_at` (timestamptz)

  ### `blog_posts`
  Stores blog articles and news updates
  - `id` (uuid, primary key)
  - `title` (text) - Article title
  - `slug` (text, unique) - URL-friendly identifier
  - `excerpt` (text) - Short summary
  - `content` (text) - Full article content
  - `image_url` (text) - Featured image URL
  - `published` (boolean) - Publication status
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `contact_requests`
  Stores contact form submissions
  - `id` (uuid, primary key)
  - `name` (text) - Contact name
  - `email` (text) - Contact email
  - `phone` (text) - Contact phone
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - Request status (pending/contacted/resolved)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for services and published blog posts
  - Authenticated admin access for inserts/updates
  - Public insert access for contact requests
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL DEFAULT 'FileText',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  image_url text,
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Anyone can submit contact requests"
  ON contact_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

INSERT INTO services (title, description, icon_name, display_order) VALUES
  ('Actas Notariales', 'Certificación de hechos, protocolización de documentos y levantamiento de actas constitutivas.', 'FileText', 1),
  ('Poderes y Mandatos', 'Elaboración de poderes generales, especiales y cartas poder para trámites nacionales e internacionales.', 'Scale', 2),
  ('Compraventa de Inmuebles', 'Formalización de operaciones de compraventa, garantizando seguridad jurídica en transacciones inmobiliarias.', 'Home', 3),
  ('Testamentos', 'Asesoría y formalización de testamentos públicos abiertos para proteger el patrimonio familiar.', 'ScrollText', 4),
  ('Constitución de Sociedades', 'Tramitación completa para la creación de empresas y sociedades mercantiles.', 'Briefcase', 5),
  ('Certificaciones y Fe de Hechos', 'Certificación de copias, firmas y hechos para trámites legales diversos.', 'Award', 6);

INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at) VALUES
  (
    'Errores Comunes al Utilizar un Servicio Notarial',
    'errores-comunes-servicio-notarial',
    'Conoce los errores más frecuentes que cometen las personas al acudir a una notaría y cómo evitarlos para agilizar tus trámites.',
    'Al acudir a una notaría, muchas personas cometen errores que pueden retrasar sus trámites. Entre los más comunes están: no llevar identificación oficial vigente, presentar documentos incompletos, no verificar la autenticidad de los documentos, y no solicitar asesoría previa. Es fundamental preparar toda la documentación necesaria antes de la cita, verificar que todos los datos estén correctos, y consultar con anticipación los requisitos específicos para cada trámite. Esto ahorrará tiempo y evitará contratiempos innecesarios.',
    true,
    now() - interval '5 days'
  ),
  (
    'Por Qué las Notarías Públicas Son Cruciales para Transacciones Legales',
    'importancia-notarias-transacciones-legales',
    'Las notarías públicas garantizan la legalidad y seguridad de documentos importantes. Descubre su rol fundamental en el sistema jurídico.',
    'Las notarías públicas desempeñan un papel esencial en el sistema legal, actuando como fedatarios públicos que dan fe de la autenticidad de documentos y actos jurídicos. Su función va más allá de certificar firmas: garantizan que las partes involucradas actúan con plena voluntad y conocimiento, verifican identidades, asesoran sobre las implicaciones legales de los actos, y protegen contra fraudes. En transacciones inmobiliarias, constitución de sociedades, testamentos y poderes, la intervención notarial es indispensable para brindar seguridad jurídica y prevenir conflictos futuros.',
    true,
    now() - interval '12 days'
  ),
  (
    'Guía Paso a Paso para Notarizar Documentos Importantes',
    'guia-notarizar-documentos',
    'Proceso completo para notarizar documentos: desde la preparación hasta la obtención del documento certificado.',
    'Notarizar un documento es un proceso sencillo si sigues estos pasos: 1) Identifica el tipo de documento que necesitas notarizar. 2) Reúne todos los documentos originales y copias necesarias. 3) Asegúrate de tener identificación oficial vigente (INE/Pasaporte). 4) Solicita una cita en la notaría. 5) Acude con todas las partes involucradas si es necesario. 6) El notario verificará identidades y revisará documentos. 7) Se procede a la lectura y firma del instrumento. 8) Se pagan los honorarios correspondientes. 9) Recibes el documento certificado con el sello y firma del notario. Es recomendable solicitar copias certificadas adicionales para tus archivos.',
    true,
    now() - interval '20 days'
  ),
  (
    'Cómo Autenticar Documentos Legales Correctamente',
    'autenticar-documentos-legales',
    'Aprende la diferencia entre certificación, legalización y apostilla, y cuándo utilizar cada proceso de autenticación.',
    'La autenticación de documentos legales puede realizarse mediante tres procesos: certificación, legalización y apostilla. La certificación notarial verifica que una copia es fiel al original. La legalización es necesaria para documentos que se usarán en países sin convenio de La Haya, requiriendo validación de múltiples autoridades. La apostilla es un proceso simplificado para países firmantes del Convenio de La Haya, donde un sello especial valida el documento internacionalmente. Es crucial determinar el destino y uso del documento para elegir el proceso correcto. Un notario puede asesorarte sobre qué procedimiento necesitas según tu situación específica.',
    true,
    now() - interval '28 days'
  );