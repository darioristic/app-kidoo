import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const hasAdminClient = Boolean(url && key);
export const supabaseAdmin = hasAdminClient ? createClient(url, key) : ({} as any);