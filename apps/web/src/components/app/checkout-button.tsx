"use client";

import { useState } from "react";

export function CheckoutButton({ priceId }: { priceId?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!priceId) return;
    setLoading(true);
    setError(null);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Impossible de lancer Stripe Checkout.");
      return;
    }
    const data = (await response.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="mt-4 space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={loading || !priceId}
        className="w-full rounded-xl bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {loading ? "Redirection..." : "Passer au premium"}
      </button>
      {error ? <p className="text-xs text-rose-700">{error}</p> : null}
    </div>
  );
}
