// types removed to avoid @vercel/node dependency during build

export default async function handler(req: any, res: any) {
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