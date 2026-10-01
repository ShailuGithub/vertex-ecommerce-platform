import { cookies } from "next/headers";
import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface OrderListItem {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
}

async function getOrders(): Promise<OrderListItem[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/orders`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminOrdersPage() {
  const user = await requireStoreUser();
  const orders = await getOrders();

  return (
    <AdminShell user={user}>
      <PageHeader title="Orders" subtitle={`${orders.length} order${orders.length === 1 ? "" : "s"}`} />

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Orders placed on your storefront will show up here." />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/orders/${order.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-600">₹{order.total}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
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
