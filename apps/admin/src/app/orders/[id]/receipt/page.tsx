import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireStoreUser } from "@/lib/server-auth";
import PrintButton from "./PrintButton";

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
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  items: OrderItem[];
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

export default async function OrderReceiptPage({ params }: { params: { id: string } }) {
  await requireStoreUser();
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <p className="text-sm text-slate-500">Receipt for {order.orderNumber}</p>
        <PrintButton />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Receipt</h1>
            <p className="mt-1 text-sm text-slate-500">Order {order.orderNumber}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>{new Date(order.createdAt).toLocaleString()}</p>
            <p className="mt-1 font-medium text-slate-700">{order.status.replace(/_/g, " ")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-slate-200 py-6 text-sm">
          <div>
            <p className="font-medium text-slate-900">Billed to</p>
            <p className="mt-1 text-slate-600">
              {order.customer.firstName} {order.customer.lastName}
              <br />
              {order.customer.email}
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Shipped to</p>
            <p className="mt-1 leading-relaxed text-slate-600">
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
          </div>
        </div>

        <table className="w-full py-6 text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-3 font-medium">Item</th>
              <th className="py-3 text-right font-medium">Qty</th>
              <th className="py-3 text-right font-medium">Price</th>
              <th className="py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 text-slate-700">
                  {item.productNameSnapshot}
                  <span className="ml-1 text-slate-400">({item.skuSnapshot})</span>
                </td>
                <td className="py-3 text-right text-slate-600">{item.quantity}</td>
                <td className="py-3 text-right text-slate-600">₹{item.unitPrice}</td>
                <td className="py-3 text-right font-medium text-slate-900">₹{item.lineTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto flex max-w-xs flex-col gap-1.5 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Shipping</span>
            <span>₹{order.shippingCost}</span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>₹{order.tax}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-semibold text-slate-900">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
