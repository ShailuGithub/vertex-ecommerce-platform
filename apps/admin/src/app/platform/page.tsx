import { cookies } from "next/headers";
import { requirePlatformAdmin } from "@/lib/server-auth";
import PlatformShell from "@/components/PlatformShell";
import PageHeader from "@/components/PageHeader";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/EmptyState";
import PlatformStoreTable from "./PlatformStoreTable";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface StoreRow {
  id: number;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

async function getStores(): Promise<StoreRow[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/platform/stores`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function PlatformDashboardPage() {
  const admin = await requirePlatformAdmin();
  const stores = await getStores();

  return (
    <PlatformShell admin={admin}>
      <PageHeader title="Stores" subtitle={`${stores.length} store${stores.length === 1 ? "" : "s"} on the platform`} />
      {stores.length === 0 ? (
        <EmptyState title="No stores yet" description="Merchants who sign up will appear here." />
      ) : (
        <Card>
          <PlatformStoreTable stores={stores} />
        </Card>
      )}
    </PlatformShell>
  );
}
