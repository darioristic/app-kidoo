export const createCheckoutSession = async (subdomain: string, plan: string): Promise<string | null> => {
  try {
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subdomain, plan })
    });
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
};