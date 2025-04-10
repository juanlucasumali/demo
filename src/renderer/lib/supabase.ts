import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.RENDERER_VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.RENDERER_VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 