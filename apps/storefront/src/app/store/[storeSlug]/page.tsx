import Link from "next/link";
import { notFound } from "next/navigation";
import { LifeBuoy, Lock, RotateCcw, Truck } from "lucide-react";
import { getStore } from "@/lib/store";
import ProductGrid, { ProductListItem } from "@/components/ProductGrid";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const API_URL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? "http://localhost:3001")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001");

interface Category {
  id: number;
  name: string;
  slug: string;
}

async function getCategories(storeSlug: string): Promise<Category[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getFeaturedProducts(storeSlug: string): Promise<ProductListItem[]> {
  const res = await fetch(`${API_URL}/stores/${storeSlug}/products?page=1&pageSize=8`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}

const SERVICES = [
  { icon: RotateCcw, title: "Easy Returns", description: "Hassle-free return policy" },
  { icon: LifeBuoy, title: "Support", description: "We're here to help" },
  { icon: Lock, title: "Secure Payment", description: "Powered by Razorpay" },
  { icon: Truck, title: "Order Tracking", description: "Track from your account" },
];

export default async function StoreHomePage({ params }: { params: { storeSlug: string } }) {
  const store = await getStore(params.storeSlug);
  if (!store) notFound();

  const [categories, products] = await Promise.all([
    getCategories(params.storeSlug),
    getFeaturedProducts(params.storeSlug),
  ]);

  return (
    <div className="pb-16">
      <Hero shopHref={`/store/${store.slug}/search`} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Features items={SERVICES} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
        {categories.length === 0 ? (
          <p className="text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/store/${store.slug}/categories/${category.slug}`}>
                <Card className="flex items-center justify-center h-24 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <span className="font-medium text-foreground px-2">{category.name}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Our Products</h2>
        <ProductGrid storeSlug={store.slug} products={products} />
        <div className="text-center mt-10">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href={`/store/${store.slug}/search`}>View All Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
