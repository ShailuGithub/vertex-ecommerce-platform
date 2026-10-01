"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  AnalyticsIcon,
  BoxIcon,
  CustomersIcon,
  DiscountIcon,
  ExternalLinkIcon,
  GearIcon,
  HomeIcon,
  ReceiptIcon,
  TagIcon,
  UsersIcon,
} from "@/components/icons";
import LogoutButton from "@/components/LogoutButton";
import type { MerchantUser } from "@/lib/server-auth";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { className?: string }) => JSX.Element;
  ownerOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/products", label: "Products", icon: BoxIcon },
  { href: "/categories", label: "Categories", icon: TagIcon },
  { href: "/orders", label: "Orders", icon: ReceiptIcon },
  { href: "/customers", label: "Audience", icon: CustomersIcon },
  { href: "/coupons", label: "Discounts", icon: DiscountIcon },
  { href: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { href: "/staff", label: "Staff", icon: UsersIcon, ownerOnly: true },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "http://localhost:3000";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({ user, children }: { user: MerchantUser; children: ReactNode }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || user.role === "STORE_OWNER");
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-900">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
            V
          </div>
          <span className="min-w-0 flex-1 truncate text-base font-semibold text-white">Vertex Admin</span>
          {user.storeSlug && (
            <a
              href={`${STOREFRONT_URL}/store/${user.storeSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Open storefront"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          )}
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-xs text-slate-400">{user.role.replace(/_/g, " ")}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
