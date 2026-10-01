"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const emptyForm = { returnsEnabled: false, returnWindowDays: "" };

export default function ReturnsSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          returnsEnabled: Boolean(s.returnsEnabled),
          returnWindowDays: s.returnWindowDays != null ? String(s.returnWindowDays) : "",
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
      await apiFetch("/store/settings/returns", {
        method: "PATCH",
        body: JSON.stringify({
          returnsEnabled: form.returnsEnabled,
          returnWindowDays: form.returnWindowDays ? Number(form.returnWindowDays) : undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save returns settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Returns</p>
        <p className="text-xs text-slate-500">Whether customers can request returns, and the window to do so.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.returnsEnabled}
              onChange={(e) => setForm((p) => ({ ...p, returnsEnabled: e.target.checked }))}
            />
            Accept returns
          </label>

          {form.returnsEnabled && (
            <Field label="Return window (days)">
              <Input
                type="number"
                min={0}
                max={365}
                value={form.returnWindowDays}
                onChange={(e) => setForm((p) => ({ ...p, returnWindowDays: e.target.value }))}
              />
            </Field>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save returns settings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
