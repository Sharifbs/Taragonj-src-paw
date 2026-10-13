import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dymjjtmhcgypbggizvws.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_FULL_PUBLISHABLE_API_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);