"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { apiFetch } from "@/lib/api";
import PageContainer from "@/components/PageContainer";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import Card, { CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Field, Input } from "@/components/ui/Input";

interface Address {
  id: number;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "",
    recipientName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: "",
  });

  function load() {
    apiFetch(`/stores/${storeSlug}/addresses`)
      .then(setAddresses)
      .catch((err) => {
        setAddresses(null);
        if (err instanceof Error && err.message.includes("401")) {
          router.push(`/store/${storeSlug}/login`);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load addresses");
        }
      });
  }

  useEffect(load, [storeSlug]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await apiFetch(`/stores/${storeSlug}/addresses`, { method: "POST", body: JSON.stringify(form) });
      setForm({
        label: "",
        recipientName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        phone: "",
      });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id: number) {
    await apiFetch(`/stores/${storeSlug}/addresses/${id}/default`, { method: "PATCH" });
    load();
  }

  async function remove(id: number) {
    await apiFetch(`/stores/${storeSlug}/addresses/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Your addresses</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>+ Add address</Button>}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBanner>{error}</ErrorBanner>
        </div>
      )}

      {addresses && addresses.length === 0 && !showForm && (
        <EmptyState title="No saved addresses yet" description="Add one to speed up checkout." icon={MapPin} />
      )}

      {addresses && addresses.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardBody>
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{address.label || "Address"}</span>
                  </div>
                  {address.isDefault && <Badge>Default</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.recipientName}
                  <br />
                  {address.line1}
                  {address.line2 && (
                    <>
                      <br />
                      {address.line2}
                    </>
                  )}
                  <br />
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <div className="mt-3 flex gap-4">
                  {!address.isDefault && (
                    <button onClick={() => setDefault(address.id)} className="text-sm text-primary hover:underline">
                      Set default
                    </button>
                  )}
                  <button onClick={() => remove(address.id)} className="text-sm text-destructive hover:underline">
                    Remove
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New address</CardTitle>
          </CardHeader>
          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="Label (e.g. Home)">
                <Input value={form.label} onChange={update("label")} />
              </Field>
              <Field label="Recipient name">
                <Input value={form.recipientName} onChange={update("recipientName")} required />
              </Field>
              <Field label="Address line 1">
                <Input value={form.line1} onChange={update("line1")} required />
              </Field>
              <Field label="Address line 2 (optional)">
                <Input value={form.line2} onChange={update("line2")} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City">
                  <Input value={form.city} onChange={update("city")} required />
                </Field>
                <Field label="State">
                  <Input value={form.state} onChange={update("state")} required />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Postal code">
                  <Input value={form.postalCode} onChange={update("postalCode")} required />
                </Field>
                <Field label="Country">
                  <Input value={form.country} onChange={update("country")} required />
                </Field>
              </div>
              <Field label="Phone">
                <Input value={form.phone} onChange={update("phone")} />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save address"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}
    </PageContainer>
  );
}
