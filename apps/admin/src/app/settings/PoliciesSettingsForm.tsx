"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";

interface StorePolicies {
  checkoutPolicyText: string | null;
  taxPolicyText: string | null;
  returnsPolicyText: string | null;
}

const emptyForm = { checkoutPolicyText: "", taxPolicyText: "", returnsPolicyText: "" };

export default function PoliciesSettingsForm() {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: StorePolicies) =>
        setForm({
          checkoutPolicyText: s.checkoutPolicyText ?? "",
          taxPolicyText: s.taxPolicyText ?? "",
          returnsPolicyText: s.returnsPolicyText ?? "",
        }),
      )
      .catch(() => {});
  }, []);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiFetch("/store/settings/policies", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save policies");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Checkout, tax & returns policies</p>
        <p className="text-xs text-slate-500">Shown to customers as reference text — free-form for now.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Checkout policy">
            <Textarea value={form.checkoutPolicyText} onChange={update("checkoutPolicyText")} rows={4} />
          </Field>
          <Field label="Tax policy">
            <Textarea value={form.taxPolicyText} onChange={update("taxPolicyText")} rows={4} />
          </Field>
          <Field label="Returns policy">
            <Textarea value={form.returnsPolicyText} onChange={update("returnsPolicyText")} rows={4} />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save policies"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
