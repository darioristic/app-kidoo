export default async function handler(req: any, res: any) {
  const { supabaseAdmin, hasAdminClient } = await import('../../services/supabaseAdmin');
  if (!hasAdminClient) return res.status(200).json({ ok: true, tenants: [], page: 1, hasMore: false });
  if (req.method === 'GET') {
    try {
      const q = (req.query?.query as string) || '';
      const page = Number(req.query?.page || 1);
      const limit = 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      let builder = supabaseAdmin.from('workspaces').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (q) builder = builder.ilike('name', `%${q}%`);
      const { data, count } = await builder.range(from, to);
      const total = count || 0;
      const hasMore = page * limit < total;
      return res.status(200).json({ tenants: data || [], page, hasMore });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  } else if (req.method === 'POST') {
    try {
      const { action } = req.body || {};
      const { writeAudit } = await import('./_audit');
      if (action === 'create') {
        const { name, subdomain, language, timezone, plan } = req.body || {};
        if (!name || !subdomain) return res.status(400).json({ error: 'name and subdomain required' });
        const { data } = await supabaseAdmin.from('workspaces').insert({ name, subdomain, language, timezone, plan, status: 'active' }).select('*').single();
        await writeAudit(null, 'create_tenant', data?.id, { name, subdomain });
        return res.status(200).json({ ok: true, tenant: data });
      }
      if (action === 'update') {
        const { id, ...fields } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id required' });
        const { data } = await supabaseAdmin.from('workspaces').update(fields).eq('id', id).select('*').single();
        await writeAudit(null, 'update_tenant', id, fields);
        return res.status(200).json({ ok: true, tenant: data });
      }
      if (action === 'set_owner') {
        const { id, subdomain, owner_user_id } = req.body || {};
        if (!owner_user_id) return res.status(400).json({ error: 'owner_user_id required' });
        if (!id && !subdomain) return res.status(400).json({ error: 'id or subdomain required' });
        let targetId = id;
        if (!targetId && subdomain) {
          const { data } = await supabaseAdmin.from('workspaces').select('id').eq('subdomain', subdomain).limit(1).single();
          targetId = data?.id;
        }
        if (!targetId) return res.status(404).json({ error: 'workspace not found' });
        const { data } = await supabaseAdmin.from('workspaces').update({ owner_user_id }).eq('id', targetId).select('*').single();
        await writeAudit(null, 'set_owner', targetId, { owner_user_id });
        return res.status(200).json({ ok: true, tenant: data });
      }
      if (action === 'delete') {
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ error: 'id required' });
        await supabaseAdmin.from('workspaces').delete().eq('id', id);
        await writeAudit(null, 'delete_tenant', id);
        return res.status(200).json({ ok: true });
      }
      return res.status(400).json({ error: 'Unknown action' });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}