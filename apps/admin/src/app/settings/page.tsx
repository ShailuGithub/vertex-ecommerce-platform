import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import SettingsTabs from "./SettingsTabs";

export default async function SettingsPage() {
  const user = await requireStoreUser();

  return (
    <AdminShell user={user}>
      <PageHeader title="Store settings" subtitle="Manage your store profile, domain, policies, and payments" />
      <SettingsTabs />
    </AdminShell>
  );
}
