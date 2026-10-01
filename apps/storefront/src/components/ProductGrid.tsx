import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  variants: {
    id: number;
    images: { url: string; isPrimary: boolean }[];
    inventory: { quantityOnHand: number } | null;
  }[];
}

export default function ProductGrid({ storeSlug, products }: { storeSlug: string; products: ProductListItem[] }) {
  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try a different search or category." />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} storeSlug={storeSlug} product={product} />
      ))}
    </div>
  );
}
