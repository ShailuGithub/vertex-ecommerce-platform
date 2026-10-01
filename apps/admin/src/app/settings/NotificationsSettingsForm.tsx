"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const emptyForm = {
  notificationEmail: "",
  notifyNewOrder: true,
  notifyLowStock: true,
  notifyCustomerSignup: false,
};

export default function NotificationsSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          notificationEmail: s.notificationEmail ?? "",
          notifyNewOrder: Boolean(s.notifyNewOrder),
          notifyLowStock: Boolean(s.notifyLowStock),
          notifyCustomerSignup: Boolean(s.notifyCustomerSignup),
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
      await apiFetch("/store/settings/notifications", {
        method: "PATCH",
        body: JSON.stringify({ ...form, notificationEmail: form.notificationEmail.trim() }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Notifications</p>
        <p className="text-xs text-slate-500">Preferences for alert emails. No emails are sent yet — this only stores your preference.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Notification email">
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.notificationEmail}
              onChange={(e) => setForm((p) => ({ ...p, notificationEmail: e.target.value }))}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.notifyNewOrder}
              onChange={(e) => setForm((p) => ({ ...p, notifyNewOrder: e.target.checked }))}
            />
            New order placed
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.notifyLowStock}
              onChange={(e) => setForm((p) => ({ ...p, notifyLowStock: e.target.checked }))}
            />
            Product low on stock
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.notifyCustomerSignup}
              onChange={(e) => setForm((p) => ({ ...p, notifyCustomerSignup: e.target.checked }))}
            />
            New customer signup
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save notification settings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
