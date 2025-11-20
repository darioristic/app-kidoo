import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.status(200).json({
      ok: true,
      time: new Date().toISOString(),
      env: {
        VITE_BASE_DOMAIN: process.env.VITE_BASE_DOMAIN || null,
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'set' : null,
      },
      node: process.version,
    })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e.message })
  }
}