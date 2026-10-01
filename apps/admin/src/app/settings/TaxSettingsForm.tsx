"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const emptyForm = { taxEnabled: false, taxRatePercent: "", taxInclusive: false };

export default function TaxSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          taxEnabled: Boolean(s.taxEnabled),
          taxRatePercent: s.taxRatePercent != null ? String(s.taxRatePercent) : "",
          taxInclusive: Boolean(s.taxInclusive),
        }),
      )
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiFetch("/store/settings/tax", {
        method: "PATCH",
        body: JSON.stringify({
          taxEnabled: form.taxEnabled,
          taxRatePercent: form.taxRatePercent ? Number(form.taxRatePercent) : undefined,
          taxInclusive: form.taxInclusive,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tax settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Tax</p>
        <p className="text-xs text-slate-500">Applied to orders at checkout.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.taxEnabled}
              onChange={(e) => setForm((p) => ({ ...p, taxEnabled: e.target.checked }))}
            />
            Charge tax on orders
          </label>

          {form.taxEnabled && (
            <>
              <Field label="Tax rate (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.taxRatePercent}
                  onChange={(e) => setForm((p) => ({ ...p, taxRatePercent: e.target.value }))}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.taxInclusive}
                  onChange={(e) => setForm((p) => ({ ...p, taxInclusive: e.target.checked }))}
                />
                Prices already include tax
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save tax settings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
