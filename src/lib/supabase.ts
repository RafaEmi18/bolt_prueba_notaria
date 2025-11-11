import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Service = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  display_order: number;
  created_at: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactRequest = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
};
