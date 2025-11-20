export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const token = process.env.VERCEL_API_TOKEN
    if (!token) return res.status(400).json({ error: 'VERCEL_API_TOKEN missing' })
    const fs = await import('fs')
    const path = await import('path')
    const pjPath = path.join(process.cwd(), '.vercel', 'project.json')
    if (!fs.existsSync(pjPath)) return res.status(400).json({ error: 'project.json missing' })
    const pj = JSON.parse(fs.readFileSync(pjPath, 'utf-8'))
    const pid = pj.projectId
    const { key, value, targets } = req.body || {}
    if (!key || typeof value !== 'string') return res.status(400).json({ error: 'key and value required' })
    const body = {
      key,
      value,
      target: Array.isArray(targets) && targets.length ? targets : ['production', 'preview'],
      type: 'encrypted',
    }
    const r = await fetch(`https://api.vercel.com/v10/projects/${pid}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    const d = await r.json()
    if (!r.ok) return res.status(r.status).json(d)
    return res.status(200).json({ ok: true, id: d.id })
  } catch (e: any) {
    return res.status(500).json({ error: e.message })
  }
}