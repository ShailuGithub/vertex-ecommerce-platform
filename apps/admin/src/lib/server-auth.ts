import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export interface MerchantUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "PLATFORM_ADMIN" | "STORE_OWNER" | "STORE_STAFF";
  storeId: number | null;
  storeSlug: string | null;
}

export async function getCurrentMerchantUser(): Promise<MerchantUser | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.user ?? null;
}

export async function requireStoreUser(): Promise<MerchantUser> {
  const user = await getCurrentMerchantUser();
  if (!user) redirect("/login");
  if (user.role === "PLATFORM_ADMIN") redirect("/platform");
  return user;
}

export async function requirePlatformAdmin(): Promise<MerchantUser> {
  const user = await getCurrentMerchantUser();
  if (!user) redirect("/login");
  if (user.role !== "PLATFORM_ADMIN") redirect("/");
  return user;
}

export async function requireStoreOwner(): Promise<MerchantUser> {
  const user = await requireStoreUser();
  if (user.role !== "STORE_OWNER") redirect("/");
  return user;
}
