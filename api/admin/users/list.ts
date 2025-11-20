import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabaseAdmin, hasAdminClient } from '../../../services/supabaseAdmin'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminClient) return res.status(200).json({ users: [] })
  try {
    const { data: profiles } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false })
    const { data: auth } = await supabaseAdmin.auth.admin.listUsers()
    const map: Record<string, any> = {}
    for (const p of profiles || []) map[p.id] = { id: p.id, email: p.email, role: p.role, status: 'active', last_active: p.last_active }
    for (const u of auth?.users || []) {
      const id = u.id
      const email = u.email
      if (!map[id]) map[id] = { id, email, role: 'user', status: u.banned_until ? 'banned' : 'active' }
    }
    return res.status(200).json({ users: Object.values(map) })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}