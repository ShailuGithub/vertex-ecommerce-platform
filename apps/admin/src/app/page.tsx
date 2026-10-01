import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import Card, { CardBody } from "@/components/ui/Card";
import {
  AnalyticsIcon,
  BoxIcon,
  CustomersIcon,
  DiscountIcon,
  GearIcon,
  ReceiptIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";

export default async function AdminHomePage() {
  const user = await requireStoreUser();

  const links = [
    { href: "/products", label: "Products", desc: "Manage your catalog", icon: BoxIcon },
    { href: "/categories", label: "Categories", desc: "Organize your catalog", icon: TagIcon },
    { href: "/orders", label: "Orders", desc: "Track and fulfill orders", icon: ReceiptIcon },
    { href: "/customers", label: "Customers", desc: "View who's buying from you", icon: CustomersIcon },
    { href: "/coupons", label: "Discounts", desc: "Create and manage coupon codes", icon: DiscountIcon },
    { href: "/analytics", label: "Analytics", desc: "Revenue and order insights", icon: AnalyticsIcon },
    ...(user.role === "STORE_OWNER"
      ? [{ href: "/staff", label: "Staff", desc: "Manage team access", icon: UsersIcon }]
      : []),
    { href: "/settings", label: "Settings", desc: "Payments and store config", icon: GearIcon },
  ];

  return (
    <AdminShell user={user}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome back, {user.firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Here&apos;s a quick way to get around your store.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardBody className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <link.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{link.label}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{link.desc}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
