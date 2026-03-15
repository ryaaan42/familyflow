import crypto from "node:crypto";

export const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY ?? null;

export const getStripeWebhookSecret = () => process.env.STRIPE_WEBHOOK_SECRET ?? null;

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

const parseStripeSignature = (header: string) => {
  const parts = header.split(",");
  const parsed: Record<string, string> = {};
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) parsed[key.trim()] = value.trim();
  }
  return parsed;
};

export const verifyStripeWebhookSignature = (rawBody: string, signatureHeader: string) => {
  const secret = getStripeWebhookSecret();
  if (!secret) return false;

  const parsed = parseStripeSignature(signatureHeader);
  if (!parsed.t || !parsed.v1) return false;

  const signedPayload = `${parsed.t}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parsed.v1));
  } catch {
    return false;
  }
};


export async function stripeGet<T>(path: string) {
  const key = getStripeSecretKey();
  if (!key) throw new Error("Stripe non configuré");

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}` }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Stripe API error");
  }

  return (await response.json()) as T;
}
