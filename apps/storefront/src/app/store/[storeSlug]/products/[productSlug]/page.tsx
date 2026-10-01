import { notFound } from "next/navigation";
import Link from "next/link";
import { RotateCcw, Shield, Truck } from "lucide-react";
import { getStore } from "@/lib/store";
import PageHeaderBanner from "@/components/PageHeaderBanner";
import ShopSidebar from "@/components/ShopSidebar";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductVariantPicker from "@/components/ProductVariantPicker";
import Features from "@/components/Features";
import Badge from "@/components/ui/Badge";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface ProductImage {
  url: string;
  altText: string | null;
  isPrimary: boolean;
}

interface ProductVariant {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  price: number | null;
  images: ProductImage[];
  inventory: { quantityOnHand: number } | null;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  category: { id: number; name: string; slug: string };
  variants: ProductVariant[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const PDP_FEATURES = [
  { icon: Truck, title: "Free Shipping", description: "On all orders" },
  { icon: RotateCcw, title: "Easy Returns", description: "Hassle-free return policy" },
  { icon: Shield, title: "Secure Checkout", description: "Payments via Razorpay" },
];

async function getProduct(storeSlug: string, productSlug: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/products/${productSlug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: { storeSlug: string; productSlug: string };
}) {
  const store = await getStore(params.storeSlug);
  if (!store) notFound();

  const [product, categories] = await Promise.all([
    getProduct(params.storeSlug, params.productSlug),
    getCategories(params.storeSlug),
  ]);
  if (!product) notFound();

  const images = product.variants.flatMap((v) => v.images).sort((a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : 0));
  const totalStock = product.variants.reduce((sum, v) => sum + (v.inventory?.quantityOnHand ?? 0), 0);
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.basePrice;
  const percentOff = hasDiscount
    ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
    : 0;

  return (
    <>
      <PageHeaderBanner title={product.name} storeSlug={store.slug} storeName={store.name} current={product.name} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div>
            <ShopSidebar storeSlug={store.slug} categories={categories} activeCategorySlug={product.category.slug} />
          </div>

          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <ProductImageGallery images={images} productName={product.name} />

              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{product.name}</h1>
                <p className="text-sm text-muted-foreground mb-4">
                  Category:{" "}
                  <Link href={`/store/${store.slug}/categories/${product.category.slug}`} className="hover:text-foreground">
                    {product.category.name}
                  </Link>
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-foreground">₹{product.basePrice}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-muted-foreground line-through">₹{product.compareAtPrice}</span>
                      <Badge>{percentOff}% off</Badge>
                    </>
                  )}
                </div>
                <div className="flex flex-col gap-1 mb-6 text-sm text-muted-foreground">
                  <span>Product SKU: {product.variants[0]?.sku ?? "N/A"}</span>
                  <span>
                    Available:{" "}
                    <strong className="text-primary">
                      {totalStock > 0 ? `${totalStock} items in stock` : "Out of stock"}
                    </strong>
                  </span>
                </div>
                <ProductVariantPicker storeSlug={store.slug} variants={product.variants} />
              </div>
            </div>

            {product.description && (
              <div className="mt-10 pt-10 border-t border-border">
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="mt-10 pt-10 border-t border-border">
              <Features items={PDP_FEATURES} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
