"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ShoppingCart, Sparkles, Plus, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ShoppingItem = { id: string; name: string; quantity?: string; isChecked: boolean };

export function ShoppingView() {
  const [context, setContext] = useState("Semaine standard, budget équilibré");
  const [aiItems, setAiItems] = useState<string[]>([]);
  const [manualItems, setManualItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    const res = await fetch("/api/shopping");
    if (!res.ok) {
      setError("Impossible de charger la liste de courses.");
      return;
    }
    const data = await res.json();
    setManualItems((data ?? []).map((item: any) => ({ id: item.id, name: item.name, quantity: item.quantity, isChecked: item.isChecked })));
  };

  useEffect(() => { void loadItems(); }, []);

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

  const addManual = async (labelOverride?: string) => {
    const label = (labelOverride ?? newItem).trim();
    if (!label) return;
    setSaving(true);
    const res = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: label, category: "autre" })
    });
    setSaving(false);
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      setError(payload.error ?? "Impossible d'ajouter l'article.");
      return;
    }
    const saved = await res.json();
    setManualItems((prev) => [{ id: saved.id, name: saved.name, quantity: saved.quantity, isChecked: saved.isChecked }, ...prev]);
    setNewItem("");
  };

  const toggleItem = async (id: string, isChecked: boolean) => {
    setManualItems((prev) => prev.map((i) => i.id === id ? { ...i, isChecked: !i.isChecked } : i));
    await fetch(`/api/shopping/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isChecked: !isChecked })
    });
  };

  const removeItem = async (id: string) => {
    setManualItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/shopping/${id}`, { method: "DELETE" });
  };

  const addAiToList = (item: string) => {
    if (!manualItems.some((i) => i.name.toLowerCase() === item.toLowerCase())) {
      void addManual(item);
    }
  };

  const doneCount = manualItems.filter((i) => i.isChecked).length;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden hero-sunset text-white hero-glow-coral premium-shell">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-3">
            <Badge variant="white">Liste de courses</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Courses intelligentes, zéro oubli.</h2>
            <p className="text-sm leading-6 text-white/75">Suggestions IA basées sur foyer, objectifs et repas planifiés.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            {[{ label: "Articles à faire", value: manualItems.filter((i) => !i.isChecked).length }, { label: "Cochés", value: doneCount }].map((s) => (
              <div key={s.label} className="rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="mt-1 text-3xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card><div className="space-y-4 p-6">
          <div className="flex gap-2">
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="Contexte foyer / semaine..." className="flex-1" onKeyDown={(e) => e.key === "Enter" && void askAi()} />
            <Button onClick={() => void askAi()} disabled={loading} size="sm">{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}</Button>
          </div>
          {error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          <div className="space-y-1.5">{aiItems.map((item) => {
            const alreadyAdded = manualItems.some((i) => i.name.toLowerCase() === item.toLowerCase());
            return <div key={item} className="flex items-center justify-between rounded-[14px] border border-[#e0e7ff] bg-[#f8f7ff] px-3.5 py-2.5"><span className="text-sm">{item}</span><button type="button" onClick={() => addAiToList(item)} disabled={alreadyAdded} className="rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600">{alreadyAdded ? "Ajouté" : "Ajouter"}</button></div>;
          })}</div>
        </div></Card>

        <Card><div className="space-y-4 p-6">
          <div className="flex gap-2">
            <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Ajouter un article..." onKeyDown={(e) => { if (e.key === "Enter") void addManual(); }} />
            <Button onClick={() => void addManual()} disabled={!newItem.trim() || saving} size="sm" variant="success"><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-1.5">{manualItems.map((item) => (
            <div key={item.id} className={`group flex items-center gap-3 rounded-[14px] border px-3.5 py-2.5 ${item.isChecked ? "border-emerald-100 bg-emerald-50 opacity-60" : "border-[#f3f4f6] bg-white"}`}>
              <button type="button" onClick={() => void toggleItem(item.id, item.isChecked)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${item.isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300"}`}>{item.isChecked && <Check className="h-3 w-3" />}</button>
              <span className={`flex-1 text-sm ${item.isChecked ? "line-through text-gray-400" : "text-[var(--foreground)]"}`}>{item.name}</span>
              <button type="button" onClick={() => void removeItem(item.id)} className="rounded-lg p-1 text-gray-300 hover:bg-rose-50 hover:text-rose-500"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}</div>
        </div></Card>
      </div>
    </div>
  );
}
