import { cookies } from "next/headers";
import { requireStoreOwner } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import StaffForm from "./StaffForm";
import StaffTable from "./StaffTable";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface StaffMember {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "STORE_OWNER" | "STORE_STAFF";
  isActive: boolean;
  createdAt: string;
}

async function getStaff(): Promise<StaffMember[]> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/store/staff`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function StaffPage() {
  const owner = await requireStoreOwner();
  const staff = await getStaff();

  return (
    <AdminShell user={owner}>
      <PageHeader title="Staff" subtitle="Manage who has access to your store's admin panel" />

      <div className="flex max-w-3xl flex-col gap-6">
        <Card>
          <StaffTable staff={staff} currentUserId={owner.id} />
        </Card>

        <Card className="max-w-md">
          <CardHeader>
            <p className="font-medium text-slate-900">Add staff member</p>
          </CardHeader>
          <CardBody>
            <StaffForm />
          </CardBody>
        </Card>
      </div>
    </AdminShell>
  );
}
