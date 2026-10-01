import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import OrderStatusForm from "./OrderStatusForm";
import AddNoteForm from "./AddNoteForm";
import ShipOrderForm from "./ShipOrderForm";

const SHIPPABLE_STATUSES = ["PAID", "PROCESSING"];

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface OrderItem {
  id: number;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface StatusHistoryEntry {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
  changedByUser: { firstName: string; lastName: string } | null;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingPhone: string;
  shippingMethod: "SELF" | "COURIER" | null;
  courierName: string | null;
  trackingNumber: string | null;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  items: OrderItem[];
  statusHistory: StatusHistoryEntry[];
}

async function getOrder(id: string): Promise<OrderDetail | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const user = await requireStoreUser();
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <AdminShell user={user}>
      <PageHeader
        title={order.orderNumber}
        subtitle={`${order.customer.firstName} ${order.customer.lastName} (${order.customer.email}) · Placed ${new Date(
          order.createdAt,
        ).toLocaleString()}`}
        actions={
          <>
            <Link href={`/orders/${order.id}/receipt`} target="_blank">
              <Button type="button" variant="secondary">
                Receipt
              </Button>
            </Link>
            {SHIPPABLE_STATUSES.includes(order.status) && <ShipOrderForm orderId={order.id} />}
            <OrderStatusBadge status={order.status} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <p className="font-medium text-slate-900">Items</p>
          </CardHeader>
          <CardBody>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">
                    {item.productNameSnapshot} <span className="text-slate-400">({item.skuSnapshot})</span> ×{" "}
                    {item.quantity}
                  </span>
                  <span className="font-medium text-slate-900">₹{item.lineTotal}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-700">₹{order.subtotal}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm font-semibold">
              <span className="text-slate-900">Total</span>
              <span className="text-slate-900">₹{order.total}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <p className="font-medium text-slate-900">Activity</p>
            <AddNoteForm orderId={order.id} />
          </CardHeader>
          <CardBody>
            <ul className="flex flex-col">
              {order.statusHistory.map((entry, index) => (
                <li key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        index === 0 ? "bg-brand-600" : "bg-slate-300"
                      }`}
                    />
                    {index < order.statusHistory.length - 1 && (
                      <span className="w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <div className="pb-4 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-900">{entry.status.replace(/_/g, " ")}</span>
                      <span className="text-xs text-slate-400">{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-0.5 text-slate-500">
                      {entry.changedByUser
                        ? `by ${entry.changedByUser.firstName} ${entry.changedByUser.lastName}`
                        : "Automated"}
                    </p>
                    {entry.note && <p className="mt-1 text-slate-600">{entry.note}</p>}
                  </div>
                </li>
              ))}
              {order.statusHistory.length === 0 && (
                <li className="text-sm text-slate-500">No activity yet.</li>
              )}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-medium text-slate-900">Shipping to</p>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed text-slate-600">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 && (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              )}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
              <br />
              {order.shippingPhone}
            </p>
            {order.shippingMethod && (
              <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
                <p className="font-medium text-slate-900">
                  {order.shippingMethod === "COURIER" ? order.courierName : "Self shipped"}
                </p>
                {order.trackingNumber && <p className="mt-0.5 text-slate-500">Tracking ID: {order.trackingNumber}</p>}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="font-medium text-slate-900">Update status</p>
          </CardHeader>
          <CardBody>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </CardBody>
        </Card>
      </div>
    </AdminShell>
  );
}
