"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

interface StoreProfile {
  name: string;
  slug: string;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

const emptyForm = {
  name: "",
  contactEmail: "",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function ProfileSettingsForm() {
  const [slug, setSlug] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: StoreProfile) => {
        setSlug(s.slug);
        setForm({
          name: s.name ?? "",
          contactEmail: s.contactEmail ?? "",
          contactPhone: s.contactPhone ?? "",
          addressLine1: s.addressLine1 ?? "",
          addressLine2: s.addressLine2 ?? "",
          city: s.city ?? "",
          state: s.state ?? "",
          postalCode: s.postalCode ?? "",
          country: s.country ?? "",
        });
      })
      .catch(() => {});
  }, []);

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
      await apiFetch("/store/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          contactEmail: form.contactEmail || undefined,
          contactPhone: form.contactPhone || undefined,
          addressLine1: form.addressLine1 || undefined,
          addressLine2: form.addressLine2 || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          postalCode: form.postalCode || undefined,
          country: form.country || undefined,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save store profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Store profile</p>
        <p className="text-xs text-slate-500">{slug && `vertex.local/store/${slug}`}</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Store name">
            <Input value={form.name} onChange={update("name")} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Contact email">
              <Input type="email" value={form.contactEmail} onChange={update("contactEmail")} />
            </Field>
            <Field label="Contact phone">
              <Input value={form.contactPhone} onChange={update("contactPhone")} />
            </Field>
          </div>
          <Field label="Address line 1">
            <Input value={form.addressLine1} onChange={update("addressLine1")} />
          </Field>
          <Field label="Address line 2">
            <Input value={form.addressLine2} onChange={update("addressLine2")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="City">
              <Input value={form.city} onChange={update("city")} />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={update("state")} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Postal code">
              <Input value={form.postalCode} onChange={update("postalCode")} />
            </Field>
            <Field label="Country">
              <Input value={form.country} onChange={update("country")} />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
