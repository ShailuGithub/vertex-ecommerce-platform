"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

interface ExtraCharge {
  id: number;
  name: string;
  type: "FIXED" | "PERCENTAGE";
  amount: number;
  isActive: boolean;
}

export default function ExtraChargesForm() {
  const [charges, setCharges] = useState<ExtraCharge[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch("/store/settings/extra-charges")
      .then(setCharges)
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/store/settings/extra-charges", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type, amount: Number(amount) }),
      });
      setName("");
      setAmount("");
      setType("FIXED");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add charge");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(charge: ExtraCharge) {
    await apiFetch(`/store/settings/extra-charges/${charge.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !charge.isActive }),
    });
    load();
  }

  async function remove(charge: ExtraCharge) {
    await apiFetch(`/store/settings/extra-charges/${charge.id}`, { method: "DELETE" });
    load();
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Extra charges</p>
        <p className="text-xs text-slate-500">Custom named charges applied at checkout (e.g. packaging, COD fee).</p>
      </CardHeader>
      <CardBody>
        <ul className="mb-4 flex flex-col divide-y divide-slate-100">
          {charges.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className={`font-medium ${c.isActive ? "text-slate-900" : "text-slate-400 line-through"}`}>
                  {c.name}
                </span>{" "}
                <span className="text-slate-500">
                  {c.type === "PERCENTAGE" ? `${c.amount}%` : `₹${c.amount}`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleActive(c)}>
                  {c.isActive ? "Disable" : "Enable"}
                </Button>
                <Button type="button" variant="danger" className="px-2 py-1 text-xs" onClick={() => remove(c)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
          {charges.length === 0 && <li className="py-2 text-sm text-slate-500">No extra charges yet.</li>}
        </ul>

        <form onSubmit={handleAdd} className="flex items-end gap-3 border-t border-slate-100 pt-4">
          <Field label="Name">
            <Input placeholder="Packaging fee" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Type">
            <Select value={type} onChange={(e) => setType(e.target.value as "FIXED" | "PERCENTAGE")}>
              <option value="FIXED">Fixed (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </Select>
          </Field>
          <Field label="Amount">
            <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </CardBody>
    </Card>
  );
}
