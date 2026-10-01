import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import EmptyState from "@/components/EmptyState";
import Card, { CardBody } from "@/components/ui/Card";
import { OrderStatusBadge } from "@/components/ui/Badge";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface Order {
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

async function getOrders(storeSlug: string): Promise<Order[] | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/stores/${storeSlug}/orders`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) return [];
  return res.json();
}

export default async function OrderHistoryPage({ params }: { params: { storeSlug: string } }) {
  const orders = await getOrders(params.storeSlug);
  if (orders === null) redirect(`/store/${params.storeSlug}/login`);

  return (
    <PageContainer>
      <h1 className="text-2xl font-bold text-foreground mb-6">Your orders</h1>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Your order history will show up here." icon={Package} />
      ) : (
        <Card>
          <CardBody className="p-0 divide-y divide-border">
            {orders.map((order) => (
              <Link
                key={order.orderNumber}
                href={`/store/${params.storeSlug}/orders/${order.orderNumber}/confirmation`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{order.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-medium text-foreground">₹{order.total}</span>
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}
    </PageContainer>
  );
}
