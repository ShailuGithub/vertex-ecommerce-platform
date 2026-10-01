import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import CreateCouponForm from "./CreateCouponForm";

export default async function NewCouponPage() {
  const user = await requireStoreUser();

  return (
    <AdminShell user={user}>
      <PageHeader title="New coupon" subtitle="Create a discount code for your storefront" />
      <CreateCouponForm />
    </AdminShell>
  );
}
