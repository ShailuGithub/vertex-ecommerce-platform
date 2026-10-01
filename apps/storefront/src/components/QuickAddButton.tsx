"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";

export default function QuickAddButton({ storeSlug, variantId }: { storeSlug: string; variantId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await apiFetch(`/stores/${storeSlug}/cart/items`, {
        method: "POST",
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className={`w-full ${added ? "bg-green-600 hover:bg-green-600 text-white" : ""}`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Adding…
        </>
      ) : added ? (
        <>
          <Check className="h-4 w-4" />
          Added to Cart!
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
