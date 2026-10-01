import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

async function getCurrentCustomer(storeSlug: string): Promise<Customer | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/stores/${storeSlug}/auth/me`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.customer ?? null;
}

async function getCartCount(storeSlug: string): Promise<number> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/stores/${storeSlug}/cart`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return 0;
  const cart = await res.json();
  return (cart?.items ?? []).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
}

interface CategoryLink {
  id: number;
  name: string;
  slug: string;
}

async function getCategories(storeSlug: string): Promise<CategoryLink[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeSlug: string };
}) {
  const store = await getStore(params.storeSlug);
  if (!store) notFound();

  const [customer, cartCount, categories] = await Promise.all([
    getCurrentCustomer(params.storeSlug),
    getCartCount(params.storeSlug),
    getCategories(params.storeSlug),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader store={store} customer={customer} cartCount={cartCount} categories={categories} />
      <main className="flex-1">{children}</main>
      <StoreFooter store={store} />
    </div>
  );
}
