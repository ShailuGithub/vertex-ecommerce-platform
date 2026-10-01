"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, ShoppingCart, User, X } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import type { StoreInfo } from "@/lib/store";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface CategoryLink {
  id: number;
  name: string;
  slug: string;
}

export default function StoreHeader({
  store,
  customer,
  cartCount,
  categories,
}: {
  store: StoreInfo;
  customer: Customer | null;
  cartCount: number;
  categories: CategoryLink[];
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 lg:gap-10">
            <Link href={`/store/${store.slug}`} className="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              <ShoppingBag className="h-6 w-6 text-primary" />
              {store.name}
            </Link>

            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              <Link href={`/store/${store.slug}`} className="py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href={`/store/${store.slug}/search`} className="py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                Shop
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen((v) => !v)}
                  onBlur={() => setTimeout(() => setIsCategoriesOpen(false), 150)}
                  className="flex items-center gap-1 py-2 px-4 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isCategoriesOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-border bg-popover shadow-lg py-2 z-50">
                    {categories.length === 0 ? (
                      <span className="block px-4 py-2 text-sm text-muted-foreground">No categories yet</span>
                    ) : (
                      categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/store/${store.slug}/categories/${c.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          {c.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="hidden lg:flex flex-1 max-w-md">
            <form action={`/store/${store.slug}/search`} className="relative w-full">
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                aria-label="Search products"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/store/${store.slug}/cart`}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingCart className="h-6 w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:block relative">
              <button
                onClick={() => setIsAccountOpen((v) => !v)}
                onBlur={() => setTimeout(() => setIsAccountOpen(false), 150)}
                className="flex items-center gap-2 py-2 px-3 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <User className="h-4 w-4" />
                {customer ? customer.firstName : "My Account"}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isAccountOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-popover shadow-lg py-2 z-50">
                  {customer ? (
                    <>
                      <span className="block px-4 py-1.5 text-xs text-muted-foreground truncate">{customer.email}</span>
                      <Link href={`/store/${store.slug}/account/orders`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your orders
                      </Link>
                      <Link href={`/store/${store.slug}/account/addresses`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Your addresses
                      </Link>
                      <div className="px-4 pt-2">
                        <LogoutButton storeSlug={store.slug} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href={`/store/${store.slug}/login`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Log in
                      </Link>
                      <Link href={`/store/${store.slug}/signup`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileOpen}
            >
              {isMobileOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {isMobileOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col gap-1" aria-label="Mobile navigation">
            <form action={`/store/${store.slug}/search`} className="relative mb-2">
              <input
                type="search"
                name="q"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
            <Link href={`/store/${store.slug}`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Home
            </Link>
            <Link href={`/store/${store.slug}/search`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Shop
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/store/${store.slug}/categories/${c.slug}`}
                onClick={() => setIsMobileOpen(false)}
                className="py-2 px-3 pl-6 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                {c.name}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-gray-200 flex flex-col gap-1">
              {customer ? (
                <>
                  <Link href={`/store/${store.slug}/account/orders`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Your orders
                  </Link>
                  <Link href={`/store/${store.slug}/account/addresses`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Your addresses
                  </Link>
                  <div className="px-3 pt-1">
                    <LogoutButton storeSlug={store.slug} />
                  </div>
                </>
              ) : (
                <>
                  <Link href={`/store/${store.slug}/login`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Log in
                  </Link>
                  <Link href={`/store/${store.slug}/signup`} onClick={() => setIsMobileOpen(false)} className="py-2 px-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
