import { cookies } from "next/headers";
import Link from "next/link";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EditIcon, TagIcon } from "@/components/icons";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");
const PAGE_SIZE = 20;

interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  category: { name: string };
  variants: {
    id: number;
    sku: string;
    inventory: { quantityOnHand: number; lowStockThreshold: number } | null;
  }[];
}

interface PaginatedProducts {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
}

async function getProducts(page: number, search?: string): Promise<PaginatedProducts> {
  const cookieHeader = cookies().toString();
  const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (search) params.set("search", search);
  const res = await fetch(`${API_URL}/products?${params.toString()}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return { items: [], total: 0, page, pageSize: PAGE_SIZE };
  return res.json();
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const user = await requireStoreUser();
  const page = Math.max(1, Number(searchParams.page) || 1);
  const search = searchParams.q;
  const { items: products, total } = await getProducts(page, search);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell user={user}>
      <PageHeader
        title="Products"
        subtitle={`${total} product${total === 1 ? "" : "s"} in your catalog`}
        actions={
          <>
            <Link href="/categories">
              <Button variant="secondary">
                <TagIcon className="h-4 w-4" /> Categories
              </Button>
            </Link>
            <Link href="/products/new">
              <Button>+ New product</Button>
            </Link>
          </>
        }
      />

      <form className="mb-4 max-w-sm">
        <Input name="q" placeholder="Search products…" defaultValue={search ?? ""} />
      </form>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to start building your catalog."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = p.variants.reduce(
                    (sum, v) => sum + (v.inventory?.quantityOnHand ?? 0),
                    0,
                  );
                  const isLowStock = p.variants.some(
                    (v) => v.inventory && v.inventory.quantityOnHand <= v.inventory.lowStockThreshold,
                  );
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link href={`/products/${p.slug}`} className="font-medium text-slate-900 hover:text-brand-600">
                          {p.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{p.category?.name}</td>
                      <td className="px-5 py-3 text-slate-600">
                        ₹{p.basePrice}
                        {p.compareAtPrice != null && p.compareAtPrice > p.basePrice && (
                          <span className="ml-1.5 text-xs text-slate-400 line-through">₹{p.compareAtPrice}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-slate-600">{totalStock}</span>
                        {isLowStock && (
                          <Badge tone="amber" className="ml-2">
                            Low stock
                          </Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/products/${p.slug}?edit=1`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <EditIcon className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={`/products?page=${page - 1}${search ? `&q=${search}` : ""}`}>
              <Button variant="secondary">&larr; Previous</Button>
            </Link>
          ) : (
            <Button variant="secondary" disabled>
              &larr; Previous
            </Button>
          )}
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/products?page=${page + 1}${search ? `&q=${search}` : ""}`}>
              <Button variant="secondary">Next &rarr;</Button>
            </Link>
          ) : (
            <Button variant="secondary" disabled>
              Next &rarr;
            </Button>
          )}
        </div>
      )}
    </AdminShell>
  );
}
