"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Card, { CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/separator";
import PageHeaderBanner from "@/components/PageHeaderBanner";
import { getStore, StoreInfo } from "@/lib/store";

interface CartItem {
  id: number;
  variantId: number;
  quantity: number;
  priceAtAdd: number;
  variant: {
    sku: string;
    attributes: Record<string, string>;
    product: { name: string };
    images: { url: string; isPrimary: boolean }[];
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  couponCode: string | null;
  discountAmount: number;
}

const ASSET_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function CartPage() {
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  function load() {
    apiFetch(`/stores/${storeSlug}/cart`)
      .then(setCart)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load cart"));
  }

  useEffect(load, [storeSlug]);
  useEffect(() => {
    getStore(storeSlug).then(setStore);
  }, [storeSlug]);

  async function updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    await apiFetch(`/stores/${storeSlug}/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    load();
  }

  async function removeItem(itemId: number) {
    await apiFetch(`/stores/${storeSlug}/cart/items/${itemId}`, { method: "DELETE" });
    load();
  }

  async function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    setCouponError(null);
    try {
      const updated = await apiFetch(`/stores/${storeSlug}/cart/coupon`, {
        method: "POST",
        body: JSON.stringify({ code: couponInput.trim() }),
      });
      setCart(updated);
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  }

  async function removeCoupon() {
    const updated = await apiFetch(`/stores/${storeSlug}/cart/coupon`, { method: "DELETE" });
    setCart(updated);
  }

  if (error) return <div className="container mx-auto px-4 py-12 text-destructive">{error}</div>;
  if (!cart) return <div className="container mx-auto px-4 py-12 text-muted-foreground">Loading…</div>;

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.priceAtAdd) * item.quantity, 0);
  const discountAmount = Number(cart.discountAmount) || 0;
  const total = subtotal - discountAmount;

  return (
    <>
      {store && <PageHeaderBanner title="Your Cart" storeSlug={store.slug} storeName={store.name} current="Cart" />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {cart.items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            description="Browse the catalog to add something."
            icon={ShoppingBag}
            cta={{ href: `/store/${storeSlug}/search`, label: "Browse products" }}
          />
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({cart.items.length})</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  {cart.items.map((item, i) => {
                    const image = item.variant.images.find((img) => img.isPrimary) ?? item.variant.images[0];
                    return (
                      <div key={item.id}>
                        <div className="flex gap-4">
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`${ASSET_URL}${image.url}`}
                                alt={item.variant.product.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-foreground line-clamp-2">{item.variant.product.name}</p>
                                {Object.keys(item.variant.attributes).length > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {Object.entries(item.variant.attributes)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(", ")}
                                  </p>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">₹{item.priceAtAdd} each</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-r-none"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </Button>
                                <span className="px-3 text-sm font-medium">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-l-none"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <span className="font-semibold text-foreground">
                                ₹{(Number(item.priceAtAdd) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {i < cart.items.length - 1 && <Separator className="mt-4" />}
                      </div>
                    );
                  })}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  {cart.couponCode ? (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-green-600">
                        Coupon <strong>{cart.couponCode}</strong> applied: −₹{discountAmount.toFixed(2)}
                      </span>
                      <Button variant="outline" size="sm" onClick={removeCoupon}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={applyCoupon} className="flex items-center gap-3 flex-wrap">
                      <Input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Coupon code"
                        className="max-w-xs"
                      />
                      <Button type="submit" disabled={applyingCoupon}>
                        {applyingCoupon ? "Applying…" : "Apply Coupon"}
                      </Button>
                    </form>
                  )}
                  {couponError && <p className="mt-2 text-sm text-destructive">{couponError}</p>}
                </CardBody>
              </Card>
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Shipping and tax calculated at checkout.</p>
                  <Separator />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link href={`/store/${storeSlug}/checkout`}>Proceed to Checkout</Link>
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
