"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ShoppingView() {
  const [context, setContext] = useState("2 adultes, 2 enfants, repas maison");
  const [items, setItems] = useState<string[]>([]);

  const askAi = async () => {
    const res = await fetch("/api/ai/shopping-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context })
    });
    const data = await res.json();
    setItems(data.items ?? []);
  };

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold">Liste de courses + suggestions IA</h2>
        <p className="mt-1 text-sm text-[var(--foreground-muted)]">Ajoutez votre contexte et générez une liste exploitable en 1 clic.</p>
        <div className="mt-4 flex gap-3">
          <Input value={context} onChange={(e) => setContext(e.target.value)} />
          <Button onClick={askAi}>Suggérer</Button>
        </div>
      </Card>
      <Card className="p-6">
        <ul className="space-y-2 text-sm">
          {items.length === 0 ? <li className="text-[var(--foreground-muted)]">Aucune suggestion pour le moment.</li> : null}
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </Card>
    </div>
  );
}
