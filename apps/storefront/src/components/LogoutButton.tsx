"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export default function LogoutButton({ storeSlug }: { storeSlug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch(`${API_URL}/stores/${storeSlug}/auth/logout`, { method: "POST", credentials: "include" });
    } finally {
      router.push(`/store/${storeSlug}`);
      router.refresh();
    }
  }

  return (
    <Button onClick={handleLogout} disabled={loading} variant="outline" size="sm" className="w-full">
      {loading ? "Signing out…" : "Sign out"}
    </Button>
  );
}
