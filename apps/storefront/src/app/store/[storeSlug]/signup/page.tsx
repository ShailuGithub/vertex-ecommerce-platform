"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getStore, StoreInfo } from "@/lib/store";
import AuthCard from "@/components/AuthCard";
import ErrorBanner from "@/components/ErrorBanner";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStore(storeSlug).then(setStore);
  }, [storeSlug]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/stores/${storeSlug}/auth/register`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push(`/store/${storeSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      storeName={store?.name ?? "…"}
      title="Create account"
      subtitle="Sign up to track orders and save addresses"
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/store/${storeSlug}/login`} className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name">
            <Input value={form.firstName} onChange={update("firstName")} required autoFocus />
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
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Sign up"}
        </Button>
      </form>
    </AuthCard>
  );
}
