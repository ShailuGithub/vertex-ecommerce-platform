import { cookies } from "next/headers";
import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import AddCustomerForm from "./AddCustomerForm";
import ExportCustomersButton from "./ExportCustomersButton";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface CustomerListItem {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  city: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  lifetimeSpend: number;
}

async function getCustomers(search?: string): Promise<CustomerListItem[]> {
  const cookieHeader = cookies().toString();
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const res = await fetch(`${API_URL}/customers?${params.toString()}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

const SEGMENTS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "returning", label: "Returning" },
] as const;

type SegmentId = (typeof SEGMENTS)[number]["id"];

function matchesSegment(customer: CustomerListItem, segment: SegmentId) {
  if (segment === "new") return customer.orderCount <= 1;
  if (segment === "returning") return customer.orderCount >= 2;
  return true;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string; segment?: string };
}) {
  const user = await requireStoreUser();
  const search = searchParams.q;
  const activeSegment: SegmentId = SEGMENTS.some((s) => s.id === searchParams.segment)
    ? (searchParams.segment as SegmentId)
    : "all";
  const allCustomers = await getCustomers(search);
  const newCount = allCustomers.filter((c) => matchesSegment(c, "new")).length;
  const returningCount = allCustomers.filter((c) => matchesSegment(c, "returning")).length;
  const customers = allCustomers.filter((c) => matchesSegment(c, activeSegment));

  return (
    <AdminShell user={user}>
      <PageHeader
        title="Audience"
        subtitle={`${allCustomers.length} customer${allCustomers.length === 1 ? "" : "s"}`}
        actions={
          <>
            <ExportCustomersButton customers={customers} />
            <AddCustomerForm />
          </>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {SEGMENTS.map((s) => {
          const count = s.id === "all" ? allCustomers.length : s.id === "new" ? newCount : returningCount;
          return (
            <Link
              key={s.id}
              href={{ pathname: "/customers", query: { ...(search ? { q: search } : {}), segment: s.id } }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                activeSegment === s.id
                  ? "border-b-2 border-brand-600 text-brand-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {s.label} <span className="text-xs text-slate-400">{count}</span>
            </Link>
          );
        })}
      </div>

      <form className="mb-4 max-w-sm">
        <input type="hidden" name="segment" value={activeSegment} />
        <Input name="q" placeholder="Search customers…" defaultValue={search ?? ""} />
      </form>

      {customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          description="Customers who create an account on your storefront will show up here."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Orders</th>
                  <th className="px-5 py-3">Lifetime spend</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${c.id}`} className="font-medium text-slate-900 hover:text-brand-600">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{c.email}</td>
                    <td className="px-5 py-3 text-slate-600">{c.phone ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{c.city ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-600">{c.orderCount}</td>
                    <td className="px-5 py-3 text-slate-600">₹{c.lifetimeSpend}</td>
                    <td className="px-5 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <Badge tone={c.isActive ? "green" : "slate"}>{c.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AdminShell>
  );
}
