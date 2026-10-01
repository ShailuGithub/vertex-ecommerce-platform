import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import EditCouponForm from "./EditCouponForm";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface CouponDetail {
  id: number;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  minOrderValue: number | null;
  maxDiscountAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

interface Redemption {
  id: number;
  customerId: number;
  orderId: number;
  discountAmount: number;
  createdAt: string;
}

async function getCoupon(id: string): Promise<CouponDetail | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/coupons/${id}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getRedemptions(id: string): Promise<Redemption[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/coupons/${id}/redemptions`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminCouponDetailPage({ params }: { params: { id: string } }) {
  const user = await requireStoreUser();
  const coupon = await getCoupon(params.id);
  if (!coupon) notFound();
  const redemptions = await getRedemptions(params.id);

  return (
    <AdminShell user={user}>
      <EditCouponForm coupon={coupon} />

      <Card>
        <CardHeader>
          <p className="font-medium text-slate-900">Redemptions ({redemptions.length})</p>
        </CardHeader>
        <CardBody>
          {redemptions.length === 0 ? (
            <p className="text-sm text-slate-500">This coupon hasn&apos;t been used yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="py-2">Order #</th>
                  <th className="py-2">Discount</th>
                  <th className="py-2">Used</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-600">#{r.orderId}</td>
                    <td className="py-2 text-slate-600">₹{r.discountAmount}</td>
                    <td className="py-2 text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
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
