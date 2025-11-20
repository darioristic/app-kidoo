export default async function handler(req: any, res: any) {
  const { supabaseAdmin, hasAdminClient } = await import('../../services/supabaseAdmin');
  if (!hasAdminClient) {
    if (req.query?.format === 'csv') return res.status(200).send('time,actor,action,target\n');
    return res.status(200).json({ logs: [] });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { data } = await supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (req.query?.format === 'csv') {
      const rows = (data||[]).map((row:any)=> [row.created_at, row.actor_user_id||'', row.action, row.target||''].map((v:string)=>`"${String(v).replace(/"/g,'\"')}"`).join(','));
      const csv = ['time,actor,action,target', ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
      return res.status(200).send(csv);
    }
    const logs = (data||[]).map((row:any)=> ({ time: row.created_at, actor: row.actor_user_id||'', action: row.action, target: row.target||'' }));
    return res.status(200).json({ logs });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}