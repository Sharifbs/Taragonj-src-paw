import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dymjjtmhcgypbggizvws.supabase.co';

// Always use the Publishable/Anon key for client-side requests
const supabaseAnonKey = 'sb_publishable_GU95E9CjVqRr8vci61-IcA_YjtdIA7z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);