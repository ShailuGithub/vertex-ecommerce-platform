"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";

const emptyForm = { seoTitle: "", seoDescription: "", seoKeywords: "" };

export default function SeoSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          seoTitle: s.seoTitle ?? "",
          seoDescription: s.seoDescription ?? "",
          seoKeywords: s.seoKeywords ?? "",
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
      const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      await apiFetch("/store/settings/seo", { method: "PATCH", body: JSON.stringify(body) });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save SEO settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">SEO</p>
        <p className="text-xs text-slate-500">Meta title, description and keywords for your storefront.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Meta title">
            <Input value={form.seoTitle} onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))} />
          </Field>
          <Field label="Meta description">
            <Textarea
              rows={3}
              value={form.seoDescription}
              onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
            />
          </Field>
          <Field label="Meta keywords">
            <Input
              placeholder="comma, separated, keywords"
              value={form.seoKeywords}
              onChange={(e) => setForm((p) => ({ ...p, seoKeywords: e.target.value }))}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save SEO settings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
