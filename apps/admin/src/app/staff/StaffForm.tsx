"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default function StaffForm() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/store/staff", { method: "POST", body: JSON.stringify(form) });
      setForm({ firstName: "", lastName: "", email: "", password: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add staff member");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input value={form.firstName} onChange={update("firstName")} required />
        </Field>
        <Field label="Last name">
          <Input value={form.lastName} onChange={update("lastName")} required />
        </Field>
      </div>
      <Field label="Email">
        <Input type="email" value={form.email} onChange={update("email")} required />
      </Field>
      <Field label="Temporary password">
        <Input
          type="password"
          value={form.password}
          onChange={update("password")}
          required
          minLength={8}
          placeholder="Min. 8 characters"
        />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add staff member"}
        </Button>
      </div>
    </form>
  );
}
