import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import CategoriesManager from "./CategoriesManager";

export default async function CategoriesPage() {
  const user = await requireStoreUser();

  return (
    <AdminShell user={user}>
      <PageHeader title="Categories" subtitle="Organize how products are grouped in your catalog" />
      <CategoriesManager />
    </AdminShell>
  );
}
