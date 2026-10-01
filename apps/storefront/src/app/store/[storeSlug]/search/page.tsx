import { notFound } from "next/navigation";
import { Search } from "lucide-react";
import { getStore } from "@/lib/store";
import ProductGrid, { ProductListItem } from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import PageHeaderBanner from "@/components/PageHeaderBanner";
import ShopSidebar from "@/components/ShopSidebar";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");
const PAGE_SIZE = 20;

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

async function searchProducts(storeSlug: string, query: string, page: number): Promise<PaginatedProducts> {
  const res = await fetch(
    `${API_URL}/stores/${storeSlug}/products?search=${encodeURIComponent(query)}&page=${page}&pageSize=${PAGE_SIZE}`,
    { cache: "no-store" },
  );
  if (!res.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
  return res.json();
}

async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { storeSlug: string };
  searchParams: { q?: string; page?: string };
}) {
  const store = await getStore(params.storeSlug);
  if (!store) notFound();

  const query = searchParams.q ?? "";
  const page = Math.max(1, Number(searchParams.page) || 1);
  const [{ items: products, total }, categories] = await Promise.all([
    searchProducts(params.storeSlug, query, page),
    getCategories(params.storeSlug),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeaderBanner title="Shop" storeSlug={store.slug} storeName={store.name} current="Shop" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div>
            <ShopSidebar storeSlug={store.slug} categories={categories} />
          </div>
          <div>
            <form className="relative mb-6">
              <Input type="search" name="q" placeholder="Search products…" defaultValue={query} className="pl-10 h-11" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-9" size="sm">
                Search
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mb-4">
              {total} result{total === 1 ? "" : "s"}
              {query && <> for &ldquo;{query}&rdquo;</>}
            </p>
            <ProductGrid storeSlug={params.storeSlug} products={products} />
            <Pagination
              baseHref={`/store/${params.storeSlug}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`}
              page={page}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </>
  );
}
