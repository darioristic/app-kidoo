// types removed to avoid @vercel/node dependency during build
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { to, token, firstName } = req.body || {};
    if (!to || !token) return res.status(400).json({ error: 'Missing parameters' });
    const base = process.env.BASE_DOMAIN || 'brainplaykids.com';
    const url = `https://${base}/?verify=${encodeURIComponent(token)}`;
    const from = process.env.RESEND_FROM || `no-reply@${base}`;
    const subject = 'Verify your BrainPlayKids account';
    const text = `Hello${firstName ? ' ' + firstName : ''},\n\nPlease verify your email by clicking the link:\n${url}\n\nIf you did not request this, ignore this message.`;
    await resend.emails.send({
      from,
      to,
      subject,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Email send error' });
  }
}