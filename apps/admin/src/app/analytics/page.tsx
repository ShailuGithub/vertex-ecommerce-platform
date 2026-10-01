import { cookies } from "next/headers";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import TrendChart from "./TrendChart";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface AnalyticsSummary {
  revenueThisMonth: number;
  orderCountThisMonth: number;
  avgOrderValueThisMonth: number;
  statusBreakdown: { status: string; count: number; total: number }[];
  trend: { day: string; count: number; total: number }[];
  topProducts: { productName: string; quantity: number; revenue: number }[];
}

async function getSummary(): Promise<AnalyticsSummary | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/analytics/summary?days=30`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminAnalyticsPage() {
  const user = await requireStoreUser();
  const summary = await getSummary();

  if (!summary) {
    return (
      <AdminShell user={user}>
        <PageHeader title="Analytics" subtitle="Revenue and order insights" />
        <p className="text-sm text-slate-500">Couldn&apos;t load analytics right now.</p>
      </AdminShell>
    );
  }

  const maxStatusTotal = Math.max(...summary.statusBreakdown.map((s) => s.total), 1);

  return (
    <AdminShell user={user}>
      <PageHeader title="Analytics" subtitle="Revenue and order insights for the last 30 days" />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Revenue this month</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">₹{summary.revenueThisMonth.toFixed(2)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Orders this month</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.orderCountThisMonth}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avg. order value</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              ₹{summary.avgOrderValueThisMonth.toFixed(2)}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="font-medium text-slate-900">Revenue trend</p>
          </CardHeader>
          <CardBody>
            <TrendChart data={summary.trend} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-medium text-slate-900">Orders by status</p>
          </CardHeader>
          <CardBody className="space-y-3">
            {summary.statusBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500">No orders yet.</p>
            ) : (
              summary.statusBreakdown.map((s) => (
                <div key={s.status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <OrderStatusBadge status={s.status} />
                    <span className="text-slate-600">
                      {s.count} · ₹{s.total.toFixed(0)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.max((s.total / maxStatusTotal) * 100, 3)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <p className="font-medium text-slate-900">Top products</p>
        </CardHeader>
        <CardBody>
          {summary.topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No sales yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="py-2">Product</th>
                  <th className="py-2">Units sold</th>
                  <th className="py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {summary.topProducts.map((p) => (
                  <tr key={p.productName} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 font-medium text-slate-900">{p.productName}</td>
                    <td className="py-2 text-slate-600">{p.quantity}</td>
                    <td className="py-2 text-slate-600">₹{p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </AdminShell>
  );
}
