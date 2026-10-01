"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

interface RazorpaySettings {
  razorpayKeyId: string | null;
  razorpayConnected: boolean;
}

export default function RazorpaySettingsForm() {
  const [settings, setSettings] = useState<RazorpaySettings | null>(null);
  const [form, setForm] = useState({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    razorpayWebhookSecret: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch("/store/settings")
      .then(setSettings)
      .catch(() => setSettings(null));
  }

  useEffect(load, []);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiFetch("/store/settings/razorpay", { method: "PATCH", body: JSON.stringify(form) });
      setSuccess(true);
      setForm({ razorpayKeyId: "", razorpayKeySecret: "", razorpayWebhookSecret: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save Razorpay settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <p className="font-medium text-slate-900">Razorpay</p>
        <Badge tone={settings?.razorpayConnected ? "green" : "slate"}>
          {settings?.razorpayConnected ? `Connected · ${settings.razorpayKeyId}` : "Not connected"}
        </Badge>
      </CardHeader>
      <CardBody>
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Use your Razorpay <strong>test-mode</strong> keys first (Razorpay dashboard → Settings → API Keys,
          toggled to Test Mode). Switch to live keys only after verifying a full test checkout.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Razorpay Key ID">
            <Input value={form.razorpayKeyId} onChange={update("razorpayKeyId")} required />
          </Field>
          <Field label="Razorpay Key Secret">
            <Input type="password" value={form.razorpayKeySecret} onChange={update("razorpayKeySecret")} required />
          </Field>
          <Field label="Razorpay Webhook Secret">
            <Input
              type="password"
              value={form.razorpayWebhookSecret}
              onChange={update("razorpayWebhookSecret")}
              required
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save Razorpay keys"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
