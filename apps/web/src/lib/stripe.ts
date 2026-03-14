export const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY ?? null;

export async function stripeApi<T>(path: string, body: Record<string, string>) {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe non configuré");
  }

  const params = new URLSearchParams(body);
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Stripe API error");
  }

  return (await response.json()) as T;
}
