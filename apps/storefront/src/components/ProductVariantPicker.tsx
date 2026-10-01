"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import Button from "@/components/ui/Button";

interface Variant {
  id: number;
  sku: string;
  attributes: Record<string, string>;
  inventory: { quantityOnHand: number } | null;
}

export default function ProductVariantPicker({ storeSlug, variants }: { storeSlug: string; variants: Variant[] }) {
  const inStock = (v: Variant) => !!v.inventory && v.inventory.quantityOnHand > 0;
  const [selectedId, setSelectedId] = useState(variants.find(inStock)?.id ?? variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  return (
    <div>
      {variants.length > 1 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-foreground">Options</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => {
              const label = Object.values(variant.attributes).join(" / ") || variant.sku;
              const available = inStock(variant);
              const active = variant.id === selectedId;
              return (
                <Button
                  key={variant.id}
                  type="button"
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                  disabled={!available}
                  onClick={() => {
                    setSelectedId(variant.id);
                    setQuantity(1);
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mb-4 text-sm">
        {selected && inStock(selected) ? (
          <span className="text-green-600 font-medium">In stock</span>
        ) : (
          <span className="text-destructive font-medium">Out of stock</span>
        )}
      </p>

      {selected && inStock(selected) && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-foreground">Quantity</label>
          <div className="flex items-center border border-border rounded-lg w-fit">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-r-none"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-4 py-2 min-w-[48px] text-center font-medium">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-l-none"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {selected && (
        <AddToCartButton storeSlug={storeSlug} variantId={selected.id} quantity={quantity} disabled={!inStock(selected)} />
      )}
    </div>
  );
}
