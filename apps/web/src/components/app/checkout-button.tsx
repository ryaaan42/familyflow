"use client";

import { useState } from "react";

export function CheckoutButton({ priceId }: { priceId?: string }) {
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!priceId) return;
    setLoading(true);
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId })
    });
    setLoading(false);
    if (!response.ok) return;
    const data = (await response.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={loading || !priceId}
      className="mt-4 w-full rounded-xl bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
    >
      {loading ? "Redirection..." : "Passer au premium"}
    </button>
  );
}
