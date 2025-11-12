/*
  # Create Chatbot Tables for Notary Public Website

  ## Overview
  Creates tables for chatbot functionality including conversations, messages, 
  and service requests with client information.

  ## New Tables

  ### `chatbot_conversations`
  Stores chatbot conversation sessions
  - `id` (uuid, primary key)
  - `session_id` (text, unique) - Browser session identifier
  - `status` (text) - active, completed, abandoned
  - `current_step` (text) - Current conversation step
  - `selected_service` (text) - Service selected by user
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `chatbot_messages`
  Stores individual messages in conversations
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key) - References chatbot_conversations
  - `sender` (text) - 'user' or 'bot'
  - `message` (text) - Message content
  - `message_type` (text) - 'text', 'service_selection', 'form', 'requirements'
  - `metadata` (jsonb) - Additional data (service info, form data, etc.)
  - `created_at` (timestamptz)

  ### `chatbot_service_requests`
  Stores completed service requests with client information
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key) - References chatbot_conversations
  - `service_type` (text) - 'compra_venta', 'donacion', 'poder_general'
  - `client_name` (text) - Full name
  - `nationality` (text) - Nationality
  - `birth_place` (text) - Place of birth
  - `residence` (text) - Place of residence
  - `phone` (text) - Phone number
  - `status` (text) - 'pending', 'contacted', 'completed', 'cancelled'
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
*/

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  current_step text NOT NULL DEFAULT 'welcome',
  selected_service text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('user', 'bot')),
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'service_selection', 'form', 'requirements', 'confirmation')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Tabla de solicitudes de servicio
CREATE TABLE IF NOT EXISTS chatbot_service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
  service_type text NOT NULL CHECK (service_type IN ('compra_venta', 'donacion', 'poder_general')),
  client_name text NOT NULL,
  nationality text NOT NULL,
  birth_place text NOT NULL,
  residence text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_status ON chatbot_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_conversation_id ON chatbot_service_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_status ON chatbot_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_service_type ON chatbot_service_requests(service_type);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_chatbot_conversations_updated_at 
  BEFORE UPDATE ON chatbot_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_service_requests_updated_at 
  BEFORE UPDATE ON chatbot_service_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

