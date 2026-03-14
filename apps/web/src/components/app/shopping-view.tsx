"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamilyFlowStore } from "@familyflow/shared";
import { Check, CheckCheck, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { ShoppingItem, ShoppingCategory } from "@familyflow/shared";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  epicerie: "Épicerie",
  frais: "Produits frais",
  boucherie_poisson: "Boucherie / Poisson",
  fruits_legumes: "Fruits & Légumes",
  boissons: "Boissons",
  hygiene_beaute: "Hygiène & Beauté",
  menage: "Ménage",
  bebe: "Bébé",
  animaux: "Animaux",
  autre: "Autre"
};

const CATEGORY_COLORS: Record<ShoppingCategory, string> = {
  epicerie: "bg-amber-100 text-amber-700",
  frais: "bg-blue-100 text-blue-700",
  boucherie_poisson: "bg-rose-100 text-rose-700",
  fruits_legumes: "bg-green-100 text-green-700",
  boissons: "bg-cyan-100 text-cyan-700",
  hygiene_beaute: "bg-purple-100 text-purple-700",
  menage: "bg-orange-100 text-orange-700",
  bebe: "bg-pink-100 text-pink-700",
  animaux: "bg-lime-100 text-lime-700",
  autre: "bg-gray-100 text-gray-600"
};

export function ShoppingView() {
  const householdName = useFamilyFlowStore((s) => s.profile.household.name);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newCat, setNewCat] = useState<ShoppingCategory>("epicerie");
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopping");
      if (res.ok) setItems(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const addItem = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), quantity: newQty.trim() || undefined, category: newCat })
      });
      if (res.ok) {
        const item: ShoppingItem = await res.json();
        setItems((prev) => [item, ...prev]);
        setNewName(""); setNewQty(""); setShowAddForm(false);
      }
    } finally { setAdding(false); }
  };

  const toggle = async (item: ShoppingItem) => {
    await fetch(`/api/shopping/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isChecked: !item.isChecked })
    });
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, isChecked: !i.isChecked } : i));
  };

  const remove = async (id: string) => {
    await fetch(`/api/shopping/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearChecked = async () => {
    const checked = items.filter((i) => i.isChecked);
    await Promise.all(checked.map((i) => fetch(`/api/shopping/${i.id}`, { method: "DELETE" })));
    setItems((prev) => prev.filter((i) => !i.isChecked));
  };

  const unchecked = items.filter((i) => !i.isChecked);
  const checked = items.filter((i) => i.isChecked);

  // Group unchecked by category
  const grouped = unchecked.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const k = item.category;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Hero */}
      <Card className="premium-shell overflow-hidden bg-[linear-gradient(135deg,rgba(18,18,48,0.96),rgba(68,60,167,0.92),rgba(67,139,230,0.86),rgba(255,126,107,0.78))] text-white hero-glow">
        <div className="grid gap-6 p-7 md:grid-cols-[1.3fr_0.7fr] md:p-8">
          <div className="space-y-4">
            <Badge className="w-fit bg-white/14 text-white shadow-none">Liste de courses</Badge>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-5xl">Partagée avec tout le foyer</h2>
            <p className="max-w-2xl text-[15px] leading-7 text-white/78">
              Ajoutez les articles à acheter pour {householdName}. Tous les membres voient la liste en temps réel.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3">
            <div className="rounded-[22px] border border-white/18 bg-white/10 px-5 py-4 backdrop-blur-md">
              <p className="text-sm text-white/66">À acheter</p>
              <p className="mt-1 text-3xl font-bold">{unchecked.length}</p>
            </div>
            <div className="rounded-[22px] border border-white/18 bg-white/10 px-5 py-4 backdrop-blur-md">
              <p className="text-sm text-white/66">Déjà dans le panier</p>
              <p className="mt-1 text-3xl font-bold">{checked.length}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Add bar */}
      <Card>
        <div className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Ajouter un article</h3>
            <Button size="sm" onClick={() => setShowAddForm((v) => !v)} variant={showAddForm ? "secondary" : "default"}>
              <Plus className="mr-1.5 h-4 w-4" />
              Ajouter
            </Button>
          </div>
          {showAddForm && (
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void addItem(); }}
                placeholder="Nom de l'article…"
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <input
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qté (optionnel)"
                className="w-32 rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              />
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value as ShoppingCategory)}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-muted)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <Button disabled={!newName.trim() || adding} onClick={() => void addItem()}>OK</Button>
            </div>
          )}
        </div>
      </Card>

      {/* Items à acheter */}
      {loading ? (
        <p className="text-center text-sm text-[var(--foreground-muted)] py-8">Chargement…</p>
      ) : unchecked.length === 0 && checked.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ShoppingCart className="h-10 w-10 text-[var(--foreground-subtle)]" />
            <p className="font-medium">La liste est vide</p>
            <p className="text-sm text-[var(--foreground-muted)]">Cliquez sur "Ajouter" pour démarrer.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catItems]) => (
            <Card key={cat}>
              <div className="space-y-2 p-5">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[cat as ShoppingCategory]}`}>
                    {CATEGORY_LABELS[cat as ShoppingCategory]}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">{catItems.length} article{catItems.length > 1 ? "s" : ""}</span>
                </div>
                <div className="grid gap-2">
                  {catItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-[20px] border border-[var(--border)] bg-white px-4 py-3">
                      <button type="button" onClick={() => toggle(item)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-primary)] hover:bg-[rgba(109,94,244,0.1)] transition">
                        {item.isChecked && <Check className="h-3 w-3 text-[var(--brand-primary)]" />}
                      </button>
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      {item.quantity && <span className="text-xs text-[var(--foreground-muted)]">{item.quantity}</span>}
                      <button type="button" onClick={() => remove(item.id)} className="rounded-lg p-1 text-[var(--foreground-subtle)] hover:bg-rose-100 hover:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {/* Checked items */}
          {checked.length > 0 && (
            <Card>
              <div className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-600">Dans le panier ({checked.length})</span>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => void clearChecked()}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Vider
                  </Button>
                </div>
                <div className="grid gap-2">
                  {checked.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-[20px] border border-emerald-100 bg-emerald-50/60 px-4 py-3 opacity-70">
                      <button type="button" onClick={() => toggle(item)}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="h-3 w-3 text-white" />
                      </button>
                      <span className="flex-1 text-sm line-through text-[var(--foreground-muted)]">{item.name}</span>
                      {item.quantity && <span className="text-xs text-[var(--foreground-muted)]">{item.quantity}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
