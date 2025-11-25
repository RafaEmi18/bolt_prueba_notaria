/*
 Database Initialization Script for Notaria System
 
 This script creates all necessary tables for the notary public website:
 - Main website tables (services, blog_posts, contact_requests)
 - Chatbot tables (conversations, messages, service_requests)
 
 Run this script when initializing a new database.
 */
-- ==================== MAIN WEBSITE TABLES ====================
-- Services table
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(100),
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Contact requests table
CREATE TABLE IF NOT EXISTS contact_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==================== CHATBOT TABLES ====================
-- Chatbot conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    current_step TEXT NOT NULL DEFAULT 'welcome',
    selected_service TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Chatbot messages table
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    message TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (
        message_type IN (
            'text',
            'service_selection',
            'form',
            'requirements',
            'confirmation'
        )
    ),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Chatbot service requests table
CREATE TABLE IF NOT EXISTS chatbot_service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL CHECK (
        service_type IN ('compra_venta', 'donacion', 'poder_general')
    ),
    client_name TEXT NOT NULL,
    nationality TEXT NOT NULL,
    birth_place TEXT NOT NULL,
    residence TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'contacted', 'completed', 'cancelled')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ==================== INDEXES ====================
-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order);
-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
-- Contact requests indexes
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests(status);
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON contact_requests(created_at);
-- Chatbot indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_status ON chatbot_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_conversation_id ON chatbot_service_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_status ON chatbot_service_requests(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_service_requests_service_type ON chatbot_service_requests(service_type);
-- ==================== TRIGGERS ====================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE
UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE
UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_requests_updated_at BEFORE
UPDATE ON contact_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_conversations_updated_at BEFORE
UPDATE ON chatbot_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbot_service_requests_updated_at BEFORE
UPDATE ON chatbot_service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ==================== SAMPLE DATA ====================
-- Insert sample services
INSERT INTO services (title, description, icon, display_order)
VALUES (
        'Compra Venta',
        'Asesoría y trámite completo para compra-venta de inmuebles',
        'home',
        1
    ),
    (
        'Donación',
        'Trámites de donación de bienes inmuebles',
        'gift',
        2
    ),
    (
        'Poder General',
        'Elaboración de poderes generales y especiales',
        'file-text',
        3
    ),
    (
        'Testamentos',
        'Asesoría y elaboración de testamentos',
        'scroll',
        4
    ),
    (
        'Actas Constitutivas',
        'Constitución de sociedades mercantiles',
        'building',
        5
    ),
    (
        'Fe de Hechos',
        'Certificación de hechos y documentos',
        'check-circle',
        6
    ) ON CONFLICT DO NOTHING;
-- Insert sample blog post
INSERT INTO blog_posts (
        title,
        content,
        excerpt,
        author,
        published,
        published_at
    )
VALUES (
        'Bienvenidos a Nuestra Notaría',
        'Estamos comprometidos con brindar servicios notariales de la más alta calidad. Nuestro equipo de profesionales está listo para asistirle en todos sus trámites legales.',
        'Conoce más sobre nuestros servicios y compromiso con la excelencia.',
        'Notaría Pública',
        true,
        NOW()
    ) ON CONFLICT DO NOTHING;