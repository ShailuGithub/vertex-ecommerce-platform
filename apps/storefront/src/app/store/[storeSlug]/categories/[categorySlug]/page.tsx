import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import ProductGrid, { ProductListItem } from "@/components/ProductGrid";
import Pagination from "@/components/Pagination";
import PageHeaderBanner from "@/components/PageHeaderBanner";
import ShopSidebar from "@/components/ShopSidebar";

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

async function getCategory(storeSlug: string, categorySlug: string): Promise<Category | null> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories/${categorySlug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getProducts(storeSlug: string, categoryId: number, page: number): Promise<PaginatedProducts> {
  const res = await fetch(
    `${API_URL}/stores/${storeSlug}/products?categoryId=${categoryId}&page=${page}&pageSize=${PAGE_SIZE}`,
    { cache: "no-store" },
  );
  if (!res.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
  return res.json();
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { storeSlug: string; categorySlug: string };
  searchParams: { page?: string };
}) {
  const store = await getStore(params.storeSlug);
  if (!store) notFound();

  const [category, categories] = await Promise.all([
    getCategory(params.storeSlug, params.categorySlug),
    getCategories(params.storeSlug),
  ]);
  if (!category) notFound();

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { items: products, total } = await getProducts(params.storeSlug, category.id, page);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeaderBanner title={category.name} storeSlug={store.slug} storeName={store.name} current={category.name} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div>
            <ShopSidebar storeSlug={store.slug} categories={categories} activeCategorySlug={category.slug} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              {total} product{total === 1 ? "" : "s"}
            </p>
            <ProductGrid storeSlug={params.storeSlug} products={products} />
            <Pagination
              baseHref={`/store/${params.storeSlug}/categories/${params.categorySlug}`}
              page={page}
              totalPages={totalPages}
            />
          </div>
        </div>
      </div>
    </>
  );
}
