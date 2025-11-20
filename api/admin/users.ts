export default async function handler(req: any, res: any) {
  const { supabaseAdmin, hasAdminClient } = await import('../../services/supabaseAdmin');
  if (!hasAdminClient) return res.status(200).json({ ok: true, users: [], page: 1, hasMore: false });
  if (req.method === 'GET') {
    try {
      const q = (req.query?.query as string) || '';
      const page = Number(req.query?.page || 1);
      const limit = 20;
      const { data: auth } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: limit });
      const ids = (auth?.users || []).map((u: any) => u.id);
      const { data: profiles } = await supabaseAdmin.from('profiles').select('*').in('id', ids);
      const map: Record<string, any> = {};
      for (const u of auth?.users || []) {
        if (q && u.email && !u.email.toLowerCase().includes(q.toLowerCase())) continue;
        map[u.id] = { id: u.id, email: u.email, role: 'user', status: u.banned_until ? 'banned' : 'active' };
      }
      for (const p of profiles || []) {
        if (!map[p.id]) map[p.id] = { id: p.id, email: p.email, role: p.role, status: 'active', last_active: p.last_active };
        else map[p.id] = { ...map[p.id], role: p.role, last_active: p.last_active };
      }
      const users = Object.values(map);
      const hasMore = (auth?.users?.length || 0) === limit;
      return res.status(200).json({ users, page, hasMore });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { action } = req.body || {};
      const { writeAudit } = await import('./_audit');
      if (action === 'create') {
        const { email, password, role } = req.body || {};
        const pwd = password || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        const { data } = await supabaseAdmin.auth.admin.createUser({ email, password: pwd, email_confirm: true });
        const id = data.user?.id;
        if (id) {
          await supabaseAdmin.from('profiles').upsert({ id, email, role: role || 'user' });
          await writeAudit(null, 'create_user', id, { email, role });
        }
        return res.status(200).json({ ok: true, id });
      }
      if (action === 'update') {
        const { id, role, ban } = req.body || {};
        if (role) await supabaseAdmin.from('profiles').update({ role }).eq('id', id);
        if (typeof ban !== 'undefined') await supabaseAdmin.auth.admin.updateUserById(id, { banned_until: ban ? new Date(Date.now() + 7*24*60*60*1000).toISOString() : null });
        await writeAudit(null, 'update_user', id, { role, ban });
        return res.status(200).json({ ok: true });
      }
      if (action === 'delete') {
        const { id } = req.body || {};
        await supabaseAdmin.auth.admin.deleteUser(id);
        await supabaseAdmin.from('profiles').delete().eq('id', id);
        await writeAudit(null, 'delete_user', id);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'Unknown action' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}