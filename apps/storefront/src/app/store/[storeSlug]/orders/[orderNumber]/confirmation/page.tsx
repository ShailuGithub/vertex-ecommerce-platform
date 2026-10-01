import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import Card, { CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/separator";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

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

interface Order {
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  couponCode: string | null;
  discountAmount: number;
  total: number;
  shippingName: string;
  shippingLine1: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusHistoryEntry[];
}

async function getOrder(storeSlug: string, orderNumber: string): Promise<Order | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/stores/${storeSlug}/orders/${orderNumber}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: { storeSlug: string; orderNumber: string };
}) {
  const order = await getOrder(params.storeSlug, params.orderNumber);
  if (!order) notFound();

  return (
    <PageContainer className="max-w-2xl">
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="mt-3 text-2xl font-bold text-foreground">Thank you!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Order <strong className="text-foreground">{order.orderNumber}</strong>{" "}
          {order.status === "PENDING_PAYMENT" ? "has been placed and is awaiting payment." : "has been placed and payment was received."}
        </p>
        <div className="mt-2">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order status</CardTitle>
        </CardHeader>
        <CardBody className="pt-0">
          <OrderStatusTimeline status={order.status} createdAt={order.createdAt} statusHistory={order.statusHistory} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardBody className="pt-0 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                {item.productNameSnapshot} <span className="text-muted-foreground">({item.skuSnapshot})</span> × {item.quantity}
              </span>
              <span className="font-medium text-foreground">₹{item.lineTotal}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">₹{order.subtotal}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>−₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total</span>
            <span className="text-primary">₹{order.total}</span>
          </div>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Shipping to</CardTitle>
        </CardHeader>
        <CardBody className="pt-0">
          <p className="text-sm text-muted-foreground">
            {order.shippingName}
            <br />
            {order.shippingLine1}
            <br />
            {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
          </p>
        </CardBody>
      </Card>

      <div className="mt-8 flex items-center justify-center gap-6 text-sm">
        <Link href={`/store/${params.storeSlug}/account/orders`} className="text-primary hover:underline">
          View order history
        </Link>
        <Link href={`/store/${params.storeSlug}`} className="text-primary hover:underline">
          Continue shopping
        </Link>
      </div>
    </PageContainer>
  );
}
