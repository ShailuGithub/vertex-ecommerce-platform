const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

export interface StoreInfo {
  id: number;
  name: string;
  slug: string;
}

export async function getStore(storeSlug: string): Promise<StoreInfo | null> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}
