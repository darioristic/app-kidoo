import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, hasAdminClient } from '../../../services/supabaseAdmin'
import { writeAudit } from '../_audit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminClient) return res.status(200).json({ ok: true })
  try {
    const { id, role, ban } = req.body || {}
    if (role) await supabaseAdmin.from('profiles').update({ role }).eq('id', id)
    if (typeof ban !== 'undefined') await supabaseAdmin.auth.admin.updateUserById(id, { banned_until: ban ? new Date(Date.now() + 7*24*60*60*1000).toISOString() : null })
    await writeAudit(null, 'update_user', id, { role, ban })
    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}