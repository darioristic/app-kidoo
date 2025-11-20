export default async function handler(req: any, res: any) {
  const { supabaseAdmin, hasAdminClient } = await import('../../services/supabaseAdmin');
  if (!hasAdminClient) return res.status(200).json({ settings: {}, envs: {} });
  if (req.method === 'GET') {
    try {
      const { data } = await supabaseAdmin.from('app_settings').select('*');
      const settings: Record<string, any> = {};
      for (const row of data || []) settings[row.key] = row.value;
      let envs: Record<string, boolean> = {};
      if (req.query?.env === '1') {
        envs = {
          SUPABASE_URL: !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL,
          SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
          VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY,
          STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
        };
      }
      return res.status(200).json({ settings, envs });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { items, key, value } = req.body || {};
      if (Array.isArray(items)) {
        for (const it of items) {
          await supabaseAdmin.from('app_settings').upsert({ key: it.key, value: it.value, updated_at: new Date().toISOString() });
        }
        return res.status(200).json({ ok: true });
      }
      if (key) {
        await supabaseAdmin.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'Missing payload' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}