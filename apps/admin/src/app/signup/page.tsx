"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import AuthCard from "@/components/AuthCard";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    storeName: "",
    storeSlug: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
        ...(field === "storeName"
          ? {
              storeSlug: value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
            }
          : {}),
      }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/register-store", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create store");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your store"
      subtitle="Set up your merchant account in a minute"
      footer={
        <>
          Already have a store?{" "}
          <a href="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Log in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Store name">
          <Input value={form.storeName} onChange={update("storeName")} required autoFocus />
        </Field>
        <Field label="Store URL slug">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white pl-3 text-sm text-slate-400 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
            <span className="whitespace-nowrap">vertexcommerce.com/</span>
            <input
              className="w-full rounded-lg bg-transparent py-2 pl-0.5 pr-3 text-slate-900 outline-none"
              value={form.storeSlug}
              onChange={update("storeSlug")}
              required
            />
          </div>
        </Field>
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
        <Field label="Password">
          <Input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={8}
            placeholder="Min. 8 characters"
          />
        </Field>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full justify-center">
          {loading ? "Creating store…" : "Create store"}
        </Button>
      </form>
    </AuthCard>
  );
}
