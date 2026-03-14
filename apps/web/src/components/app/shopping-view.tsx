"use client";

import { useState } from "react";
import { LoaderCircle, ShoppingCart, Sparkles, Plus, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ShoppingView() {
  const [context, setContext] = useState("2 adultes, 2 enfants, repas maison");
  const [aiItems, setAiItems] = useState<string[]>([]);
  const [manualItems, setManualItems] = useState<{ id: string; label: string; done: boolean }[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askAi = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/shopping-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context })
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setAiItems(data.items ?? []);
    } catch {
      setError("Impossible de générer les suggestions pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const addManual = () => {
    if (!newItem.trim()) return;
    setManualItems((prev) => [...prev, { id: crypto.randomUUID(), label: newItem.trim(), done: false }]);
    setNewItem("");
  };

  const toggleItem = (id: string) =>
    setManualItems((prev) => prev.map((i) => i.id === id ? { ...i, done: !i.done } : i));

  const removeItem = (id: string) =>
    setManualItems((prev) => prev.filter((i) => i.id !== id));

  const addAiToList = (item: string) => {
    if (!manualItems.some((i) => i.label === item)) {
      setManualItems((prev) => [...prev, { id: crypto.randomUUID(), label: item, done: false }]);
    }
  };

  const doneCount = manualItems.filter((i) => i.done).length;

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="overflow-hidden hero-sunset text-white hero-glow-coral premium-shell">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-3">
            <Badge variant="white">Liste de courses</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Courses intelligentes, zéro oubli.
            </h2>
            <p className="text-sm leading-6 text-white/75">
              Générez une liste adaptée à votre foyer en un clic, puis ajoutez vos propres articles.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {[
              { label: "Articles à faire", value: manualItems.filter((i) => !i.done).length },
              { label: "Cochés", value: doneCount },
            ].map((s) => (
              <div key={s.label} className="rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="mt-1 text-3xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* AI suggestions */}
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-[14px] bg-violet-100 p-2.5 text-violet-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Suggestions IA</h3>
                <p className="text-xs text-[var(--foreground-muted)]">Personnalisées selon votre contexte</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Décrivez votre foyer..."
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && void askAi()}
              />
              <Button onClick={() => void askAi()} disabled={loading} size="sm">
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
            )}

            {aiItems.length > 0 ? (
              <div className="space-y-1.5">
                {aiItems.map((item) => {
                  const alreadyAdded = manualItems.some((i) => i.label === item);
                  return (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-[14px] border border-[#e0e7ff] bg-[#f8f7ff] px-3.5 py-2.5"
                    >
                      <span className="text-sm text-[var(--foreground)]">{item}</span>
                      <button
                        type="button"
                        onClick={() => addAiToList(item)}
                        disabled={alreadyAdded}
                        className="flex items-center gap-1 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-200 disabled:opacity-40"
                      >
                        {alreadyAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {alreadyAdded ? "Ajouté" : "Ajouter"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : !loading ? (
              <div className="rounded-[18px] border border-dashed border-[#e0e7ff] py-10 text-center">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-[#d1d5db]" />
                <p className="text-sm text-[var(--foreground-muted)]">Cliquez sur ✦ pour générer des suggestions</p>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Manual list */}
        <Card>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-[14px] bg-lime-100 p-2.5 text-lime-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Ma liste</h3>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {manualItems.length} article{manualItems.length !== 1 ? "s" : ""} · {doneCount} coché{doneCount !== 1 ? "s" : ""}
                </p>
              </div>
              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={() => setManualItems((prev) => prev.filter((i) => !i.done))}
                  className="rounded-xl px-2.5 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50"
                >
                  Supprimer cochés
                </button>
              )}
            </div>

            {/* Add item */}
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Ajouter un article..."
                onKeyDown={(e) => { if (e.key === "Enter") { addManual(); } }}
              />
              <Button onClick={addManual} disabled={!newItem.trim()} size="sm" variant="success">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items */}
            {manualItems.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[#e0e7ff] py-10 text-center">
                <p className="text-sm text-[var(--foreground-muted)]">Votre liste est vide</p>
                <p className="mt-1 text-xs text-[var(--foreground-subtle)]">Ajoutez des articles ou importez depuis les suggestions IA</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {manualItems.map((item) => (
                  <div
                    key={item.id}
                    className={`group flex items-center gap-3 rounded-[14px] border px-3.5 py-2.5 transition ${
                      item.done
                        ? "border-emerald-100 bg-emerald-50 opacity-60"
                        : "border-[#f3f4f6] bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        item.done
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 hover:border-indigo-400"
                      }`}
                    >
                      {item.done && <Check className="h-3 w-3" />}
                    </button>
                    <span className={`flex-1 text-sm ${item.done ? "line-through text-gray-400" : "text-[var(--foreground)]"}`}>
                      {item.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1 text-gray-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
