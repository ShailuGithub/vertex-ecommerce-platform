import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge, { OrderStatusBadge } from "@/components/ui/Badge";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface Address {
  id: number;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface OrderSummary {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface CustomerDetail {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  addresses: Address[];
  orders: OrderSummary[];
}

async function getCustomer(id: string): Promise<CustomerDetail | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/customers/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  const user = await requireStoreUser();
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <AdminShell user={user}>
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={customer.email}
        actions={<Badge tone={customer.isActive ? "green" : "slate"}>{customer.isActive ? "Active" : "Inactive"}</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <p className="font-medium text-slate-900">Contact</p>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <p className="text-slate-600">{customer.email}</p>
            <p className="text-slate-600">{customer.phone ?? "No phone on file"}</p>
            <p className="text-slate-500">
              Joined {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="font-medium text-slate-900">Addresses</p>
          </CardHeader>
          <CardBody>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-slate-500">No saved addresses.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {customer.addresses.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="font-medium text-slate-900">{a.recipientName}</p>
                      {a.isDefault && <Badge tone="indigo">Default</Badge>}
                    </div>
                    <p className="text-slate-600">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}
                    </p>
                    <p className="text-slate-600">
                      {a.city}, {a.state} {a.postalCode}
                    </p>
                    <p className="text-slate-600">{a.country}</p>
                    {a.phone && <p className="text-slate-500">{a.phone}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-4">
        <h2 className="mb-3 text-sm font-medium text-slate-900">Order history</h2>
        {customer.orders.length === 0 ? (
          <EmptyState title="No orders yet" description="This customer hasn't placed an order." />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Total</th>
                    <th className="px-5 py-3">Placed</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link href={`/orders/${order.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                          {order.orderNumber}
                        </Link>
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
      </div>
    </AdminShell>
  );
}
