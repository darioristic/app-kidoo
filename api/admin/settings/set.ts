import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, hasAdminClient } from '../../../services/supabaseAdmin'
import { writeAudit } from '../_audit'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminClient) return res.status(200).json({ ok: true })
  try {
    const { key, value } = req.body || {}
    await supabaseAdmin.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() })
    await writeAudit(null, 'set_setting', key, { value })
    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}