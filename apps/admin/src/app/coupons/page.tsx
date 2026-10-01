import { cookies } from "next/headers";
import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface CouponListItem {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  usageLimitTotal: number | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
}

async function getCoupons(): Promise<CouponListItem[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/coupons`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

function statusBadge(coupon: CouponListItem) {
  if (!coupon.isActive) return <Badge tone="slate">Disabled</Badge>;
  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return <Badge tone="blue">Scheduled</Badge>;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return <Badge tone="red">Expired</Badge>;
  return <Badge tone="green">Active</Badge>;
}

export default async function AdminCouponsPage() {
  const user = await requireStoreUser();
  const coupons = await getCoupons();

  return (
    <AdminShell user={user}>
      <PageHeader
        title="Discounts"
        subtitle={`${coupons.length} coupon${coupons.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/coupons/new">
            <Button>+ New coupon</Button>
          </Link>
        }
      />

      {coupons.length === 0 ? (
        <EmptyState title="No coupons yet" description="Create a coupon code to offer discounts at checkout." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Limit</th>
                  <th className="px-5 py-3">Expiry</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/coupons/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {c.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {c.type === "PERCENTAGE" ? "Percentage" : "Fixed amount"}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.usageLimitTotal ?? "Unlimited"}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-5 py-3">{statusBadge(c)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminShell>
  );
}
