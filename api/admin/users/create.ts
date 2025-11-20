import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, hasAdminClient } from '../../../services/supabaseAdmin'
import { writeAudit } from '../_audit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminClient) return res.status(200).json({ ok: true })
  try {
    const { email, password, role } = req.body || {}
    const { data } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })
    const id = data.user?.id
    if (id) {
      await supabaseAdmin.from('profiles').upsert({ id, email, role: role || 'user' })
      await writeAudit(null, 'create_user', id, { email, role })
    }
    return res.status(200).json({ ok: true, id })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}