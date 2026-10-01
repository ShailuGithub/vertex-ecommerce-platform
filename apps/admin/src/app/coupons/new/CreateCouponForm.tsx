"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

export default function CreateCouponForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    usageLimitTotal: "",
    usageLimitPerCustomer: "",
    startsAt: "",
    expiresAt: "",
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: Number(form.value),
          minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
          maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
          usageLimitTotal: form.usageLimitTotal ? Number(form.usageLimitTotal) : undefined,
          usageLimitPerCustomer: form.usageLimitPerCustomer ? Number(form.usageLimitPerCustomer) : undefined,
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        }),
      });
      router.push("/coupons");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Coupon code">
            <Input
              value={form.code}
              onChange={update("code")}
              placeholder="e.g. SAVE10"
              required
              autoFocus
              style={{ textTransform: "uppercase" }}
            />
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
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create coupon"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
