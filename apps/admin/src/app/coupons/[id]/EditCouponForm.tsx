"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card, { CardBody } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Input";

interface Coupon {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditCouponForm({ coupon }: { coupon: Coupon }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [form, setForm] = useState({
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrderValue: coupon.minOrderValue != null ? String(coupon.minOrderValue) : "",
    maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
    usageLimitTotal: coupon.usageLimitTotal != null ? String(coupon.usageLimitTotal) : "",
    usageLimitPerCustomer: coupon.usageLimitPerCustomer != null ? String(coupon.usageLimitPerCustomer) : "",
    startsAt: toLocalInput(coupon.startsAt),
    expiresAt: toLocalInput(coupon.expiresAt),
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/coupons/${coupon.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : null,
          maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
          usageLimitTotal: form.usageLimitTotal ? Number(form.usageLimitTotal) : null,
          usageLimitPerCustomer: form.usageLimitPerCustomer ? Number(form.usageLimitPerCustomer) : null,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        }),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update coupon");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    setTogglingStatus(true);
    try {
      await apiFetch(`/coupons/${coupon.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      router.refresh();
    } finally {
      setTogglingStatus(false);
    }
  }

  if (!editing) {
    return (
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{coupon.code}</h1>
            <Badge tone={coupon.isActive ? "green" : "slate"}>{coupon.isActive ? "Active" : "Disabled"}</Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `₹${coupon.value} off`}
            </span>
            {coupon.minOrderValue != null && <span>· Min order ₹{coupon.minOrderValue}</span>}
            {coupon.usageLimitTotal != null && <span>· Limit {coupon.usageLimitTotal} uses</span>}
            {coupon.expiresAt && <span>· Expires {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}>
            Edit coupon
          </Button>
          <Button variant={coupon.isActive ? "danger" : "secondary"} onClick={toggleStatus} disabled={togglingStatus}>
            {togglingStatus ? "…" : coupon.isActive ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6 max-w-2xl">
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Coupon code">
            <Input value={form.code} onChange={update("code")} required style={{ textTransform: "uppercase" }} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount type">
              <Select value={form.type} onChange={update("type")}>
                <option value="PERCENTAGE">Percentage off</option>
                <option value="FIXED_AMOUNT">Fixed amount off</option>
              </Select>
            </Field>
            <Field label={form.type === "PERCENTAGE" ? "Percentage (%)" : "Amount (₹)"}>
              <Input type="number" value={form.value} onChange={update("value")} required min={0} step="0.01" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Minimum order value (optional)">
              <Input type="number" value={form.minOrderValue} onChange={update("minOrderValue")} min={0} step="0.01" />
            </Field>
            {form.type === "PERCENTAGE" && (
              <Field label="Max discount cap (optional)">
                <Input
                  type="number"
                  value={form.maxDiscountAmount}
                  onChange={update("maxDiscountAmount")}
                  min={0}
                  step="0.01"
                />
              </Field>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Total usage limit (optional)">
              <Input type="number" value={form.usageLimitTotal} onChange={update("usageLimitTotal")} min={1} />
            </Field>
            <Field label="Per-customer limit (optional)">
              <Input
                type="number"
                value={form.usageLimitPerCustomer}
                onChange={update("usageLimitPerCustomer")}
                min={1}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Starts at (optional)">
              <Input type="datetime-local" value={form.startsAt} onChange={update("startsAt")} />
            </Field>
            <Field label="Expires at (optional)">
              <Input type="datetime-local" value={form.expiresAt} onChange={update("expiresAt")} />
            </Field>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
