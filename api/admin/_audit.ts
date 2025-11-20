import { supabaseAdmin, hasAdminClient } from '../../services/supabaseAdmin'

export const writeAudit = async (actor: string | null, action: string, target?: string, metadata?: any) => {
  if (!hasAdminClient) return
  await supabaseAdmin.from('audit_logs').insert({ actor_user_id: actor || null, action, target, metadata: metadata || null })
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { actor, action, target, metadata } = req.body || {}
    await writeAudit(actor || null, action || 'unknown', target, metadata)
    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Audit error' })
  }
}