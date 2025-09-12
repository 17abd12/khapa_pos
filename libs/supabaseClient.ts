import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://cyrmqltnhvmpveaalvpu.supabase.co';
const supabaseAnonKey = process.env.SUPA_BASE as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
