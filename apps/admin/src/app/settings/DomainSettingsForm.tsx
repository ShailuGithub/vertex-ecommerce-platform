"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default function DomainSettingsForm() {
  const [savedDomain, setSavedDomain] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: { customDomain: string | null }) => {
        setSavedDomain(s.customDomain);
        setDomain(s.customDomain ?? "");
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const updated = await apiFetch("/store/settings/domain", {
        method: "PATCH",
        body: JSON.stringify({ customDomain: domain.trim() }),
      });
      setSavedDomain(updated.customDomain);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save domain");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <p className="font-medium text-slate-900">Custom domain</p>
        <Badge tone={savedDomain ? "green" : "slate"}>{savedDomain ? savedDomain : "Not set"}</Badge>
      </CardHeader>
      <CardBody>
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This saves the domain you plan to use for this store. Pointing the domain itself (DNS, TLS) isn&apos;t set
          up yet — that&apos;s a separate step for when you&apos;re ready to go live on it.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Domain">
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="shop.example.com"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save domain"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
