import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireStoreUser } from "@/lib/server-auth";
import AdminShell from "@/components/AdminShell";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import VariantImages from "./VariantImages";
import EditProductForm from "./EditProductForm";
import StockEditor from "./StockEditor";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface ProductImage {
  id: number;
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface Variant {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  price: number | null;
  images: ProductImage[];
  inventory: { quantityOnHand: number; lowStockThreshold: number } | null;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  brand: string | null;
  category: { id: number; name: string };
  variants: Variant[];
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const cookieHeader = cookies().toString();
  const res = await fetch(`${API_URL}/products/${slug}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminProductDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { edit?: string };
}) {
  const user = await requireStoreUser();
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <AdminShell user={user}>
      <EditProductForm product={product} startInEdit={searchParams.edit === "1"} />

      <div className="flex flex-col gap-4">
        {product.variants.map((variant) => {
          const lowStock =
            variant.inventory && variant.inventory.quantityOnHand <= variant.inventory.lowStockThreshold;
          const attrs = Object.entries(variant.attributes)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
          return (
            <Card key={variant.id} className="max-w-2xl">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{variant.sku}</p>
                  {attrs && <p className="text-sm text-slate-500">{attrs}</p>}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <StockEditor variantId={variant.id} quantityOnHand={variant.inventory?.quantityOnHand ?? 0} />
                  {lowStock && <Badge tone="amber">Low stock</Badge>}
                </div>
              </CardHeader>
              <CardBody>
                <VariantImages variantId={variant.id} images={variant.images} />
              </CardBody>
            </Card>
          );
        })}
      </div>
    </AdminShell>
  );
}
