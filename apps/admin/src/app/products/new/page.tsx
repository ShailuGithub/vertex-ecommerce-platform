import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const user = await requireStoreUser();

  return (
    <AdminShell user={user}>
      <PageHeader title="New product" subtitle="Add a product with its default variant" />
      <NewProductForm />
    </AdminShell>
  );
}
