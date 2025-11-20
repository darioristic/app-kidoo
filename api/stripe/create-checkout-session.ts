import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-11-20' as any });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { subdomain, plan } = req.body || {};
    if (!subdomain) return res.status(400).json({ error: 'Missing subdomain' });

    const priceId = plan === 'premium' ? process.env.STRIPE_PRICE_PREMIUM
      : plan === 'standard' ? process.env.STRIPE_PRICE_STANDARD
      : process.env.STRIPE_PRICE_FREE || undefined;

    if (!priceId) return res.status(400).json({ error: 'Missing Stripe price ID' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.BASE_URL}/?billing=success&sub=${subdomain}`,
      cancel_url: `${process.env.BASE_URL}/?billing=cancel&sub=${subdomain}`,
      metadata: { subdomain },
    });
    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Stripe error' });
  }
}