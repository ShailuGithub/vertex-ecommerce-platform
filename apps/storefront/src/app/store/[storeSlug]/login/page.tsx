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

export default function LoginPage() {
  const router = useRouter();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStore(storeSlug).then(setStore);
  }, [storeSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/stores/${storeSlug}/auth/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push(`/store/${storeSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      storeName={store?.name ?? "…"}
      title="Log in"
      subtitle="Sign in to your account"
      footer={
        <>
          No account?{" "}
          <Link href={`/store/${storeSlug}/signup`} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </Field>
        <Field label="Password">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <ErrorBanner>{error}</ErrorBanner>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
