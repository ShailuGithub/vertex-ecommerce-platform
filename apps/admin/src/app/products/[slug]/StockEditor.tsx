"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function StockEditor({
  variantId,
  quantityOnHand,
}: {
  variantId: number;
  quantityOnHand: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(quantityOnHand));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = value !== "" && Number(value) !== quantityOnHand;

  async function save() {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 0) {
      setError("Enter a whole number, 0 or more");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/products/variants/${variantId}/inventory`, {
        method: "PATCH",
        body: JSON.stringify({ quantityOnHand: quantity }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
      />
      <button
        onClick={save}
        disabled={saving || !dirty}
        className="rounded-lg bg-brand-600 px-3 py-1 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Update"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
