"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart } from "lucide-react";
import QuickAddButton from "@/components/QuickAddButton";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ProductListItem } from "@/components/ProductGrid";

const ASSET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function primaryImage(product: ProductListItem): string | null {
  for (const variant of product.variants) {
    const primary = variant.images.find((img) => img.isPrimary) ?? variant.images[0];
    if (primary) return primary.url;
  }
  return null;
}

export default function ProductCard({ storeSlug, product }: { storeSlug: string; product: ProductListItem }) {
  const [isLiked, setIsLiked] = useState(false);

  const image = primaryImage(product);
  const firstInStockVariant = product.variants.find((v) => v.inventory && v.inventory.quantityOnHand > 0);
  const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.basePrice;
  const percentOff = hasDiscount ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100) : 0;
  const href = `/store/${storeSlug}/products/${product.slug}`;

  function handleToggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((v) => !v);
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {hasDiscount && <Badge className="absolute top-3 left-3 z-10">{percentOff}% Off</Badge>}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Like"
          className={cn(
            "absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
            isLiked && "opacity-100 text-destructive",
          )}
          onClick={handleToggleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>

        <Link href={href} className="block relative">
          <div className="aspect-square overflow-hidden bg-muted">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${ASSET_URL}${image}`}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-sm text-muted-foreground">No image</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow">
              <Eye className="h-4 w-4" />
              Quick View
            </span>
          </div>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        <Link href={href}>
          <h3 className="font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2">
          {hasDiscount && <del className="text-sm text-muted-foreground">₹{product.compareAtPrice}</del>}
          <span className="text-lg font-bold text-foreground">₹{product.basePrice}</span>
        </div>
        {firstInStockVariant ? (
          <QuickAddButton storeSlug={storeSlug} variantId={firstInStockVariant.id} />
        ) : (
          <p className="text-sm text-muted-foreground py-2">Out of stock</p>
        )}
      </div>
    </Card>
  );
}
