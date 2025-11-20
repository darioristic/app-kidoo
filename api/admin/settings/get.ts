import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, hasAdminClient } from '../../../services/supabaseAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminClient) return res.status(200).json({ settings: {} })
  try {
    const { data } = await supabaseAdmin.from('app_settings').select('*')
    const settings: Record<string, any> = {}
    for (const row of data || []) settings[row.key] = row.value
    return res.status(200).json({ settings })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}