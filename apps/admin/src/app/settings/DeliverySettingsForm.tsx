"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

const DELIVERY_TIME_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "MIN_30_60", label: "30-60 minutes" },
  { value: "HOUR_1_4", label: "1-4 hours" },
  { value: "HOUR_6_24", label: "6-24 hours" },
  { value: "DAY_1_3", label: "1-3 days" },
  { value: "DAY_3_5", label: "3-5 days" },
  { value: "DAY_5_10", label: "5-10 days" },
  { value: "DAY_10_PLUS", label: "10+ days" },
];

const emptyForm = {
  deliveryChargeType: "FIXED" as "FIXED" | "VARIABLE",
  deliveryChargeAmount: "0",
  freeDeliveryAboveAmount: "",
  averageDeliveryTime: "",
};

export default function DeliverySettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          deliveryChargeType: s.deliveryChargeType ?? "FIXED",
          deliveryChargeAmount: String(s.deliveryChargeAmount ?? 0),
          freeDeliveryAboveAmount: s.freeDeliveryAboveAmount != null ? String(s.freeDeliveryAboveAmount) : "",
          averageDeliveryTime: s.averageDeliveryTime ?? "",
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
      await apiFetch("/store/settings/delivery", {
        method: "PATCH",
        body: JSON.stringify({
          deliveryChargeType: form.deliveryChargeType,
          deliveryChargeAmount: Number(form.deliveryChargeAmount) || 0,
          freeDeliveryAboveAmount: form.freeDeliveryAboveAmount ? Number(form.freeDeliveryAboveAmount) : undefined,
          averageDeliveryTime: form.averageDeliveryTime || undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save delivery settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Delivery</p>
        <p className="text-xs text-slate-500">Delivery charge and the estimate shown at checkout.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Charge type">
            <Select
              value={form.deliveryChargeType}
              onChange={(e) => setForm((p) => ({ ...p, deliveryChargeType: e.target.value as "FIXED" | "VARIABLE" }))}
            >
              <option value="FIXED">Fixed</option>
              <option value="VARIABLE">Variable</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Delivery charge per order">
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.deliveryChargeAmount}
                onChange={(e) => setForm((p) => ({ ...p, deliveryChargeAmount: e.target.value }))}
              />
            </Field>
            <Field label="Free delivery above">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="Optional"
                value={form.freeDeliveryAboveAmount}
                onChange={(e) => setForm((p) => ({ ...p, freeDeliveryAboveAmount: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Average delivery time">
            <Select
              value={form.averageDeliveryTime}
              onChange={(e) => setForm((p) => ({ ...p, averageDeliveryTime: e.target.value }))}
            >
              {DELIVERY_TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save delivery settings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
