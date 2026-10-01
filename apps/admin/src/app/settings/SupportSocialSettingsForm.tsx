"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

const emptyForm = {
  supportEmail: "",
  supportPhone: "",
  whatsappNumber: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  youtubeUrl: "",
};

export default function SupportSocialSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: any) =>
        setForm({
          supportEmail: s.supportEmail ?? "",
          supportPhone: s.supportPhone ?? "",
          whatsappNumber: s.whatsappNumber ?? "",
          facebookUrl: s.facebookUrl ?? "",
          instagramUrl: s.instagramUrl ?? "",
          twitterUrl: s.twitterUrl ?? "",
          youtubeUrl: s.youtubeUrl ?? "",
        }),
      )
      .catch(() => {});
  }, []);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
      await apiFetch("/store/settings/support-social", { method: "PATCH", body: JSON.stringify(body) });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save support & social settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Support & social</p>
        <p className="text-xs text-slate-500">Shown to customers on your storefront.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Support email">
              <Input type="email" value={form.supportEmail} onChange={update("supportEmail")} />
            </Field>
            <Field label="Support phone">
              <Input value={form.supportPhone} onChange={update("supportPhone")} />
            </Field>
          </div>
          <Field label="WhatsApp number">
            <Input value={form.whatsappNumber} onChange={update("whatsappNumber")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Facebook URL">
              <Input placeholder="https://facebook.com/…" value={form.facebookUrl} onChange={update("facebookUrl")} />
            </Field>
            <Field label="Instagram URL">
              <Input
                placeholder="https://instagram.com/…"
                value={form.instagramUrl}
                onChange={update("instagramUrl")}
              />
            </Field>
            <Field label="Twitter / X URL">
              <Input placeholder="https://x.com/…" value={form.twitterUrl} onChange={update("twitterUrl")} />
            </Field>
            <Field label="YouTube URL">
              <Input placeholder="https://youtube.com/…" value={form.youtubeUrl} onChange={update("youtubeUrl")} />
            </Field>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
