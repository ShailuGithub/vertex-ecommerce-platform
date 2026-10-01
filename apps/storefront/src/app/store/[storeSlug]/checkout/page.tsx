"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStore, StoreInfo } from "@/lib/store";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";
import PageHeaderBanner from "@/components/PageHeaderBanner";
import { Field, Input, Select } from "@/components/ui/Input";
import Card, { CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/separator";
import Button from "@/components/ui/Button";

interface SavedAddress {
  id: number;
  label: string | null;
  recipientName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

interface CartItemSummary {
  priceAtAdd: number;
  quantity: number;
  variant: { sku: string; product: { name: string } };
}

interface CartSummary {
  items: CartItemSummary[];
  couponCode: string | null;
  discountAmount: number;
}

const emptyForm = {
  shippingName: "",
  shippingLine1: "",
  shippingLine2: "",
  shippingCity: "",
  shippingState: "",
  shippingPostalCode: "",
  shippingCountry: "India",
  shippingPhone: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { storeSlug } = useParams<{ storeSlug: string }>();
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStore(storeSlug).then(setStore);
    apiFetch(`/stores/${storeSlug}/addresses`)
      .then((addresses: SavedAddress[]) => {
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (defaultAddress) applyAddress(defaultAddress);
      })
      .catch(() => {
        // guest or no saved addresses - just leave the form blank, nothing to fill in
      });
    apiFetch(`/stores/${storeSlug}/cart`)
      .then(setCartSummary)
      .catch(() => {
        // summary is a nice-to-have; ignore failures
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  function applyAddress(address: SavedAddress) {
    setForm({
      shippingName: address.recipientName,
      shippingLine1: address.line1,
      shippingLine2: address.line2 ?? "",
      shippingCity: address.city,
      shippingState: address.state,
      shippingPostalCode: address.postalCode,
      shippingCountry: address.country,
      shippingPhone: address.phone ?? "",
    });
  }

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const currentStore = await getStore(storeSlug);
      if (!currentStore) throw new Error("Store not found");

      const order = await apiFetch(`/stores/${storeSlug}/orders`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      const razorpayOrder = await apiFetch(`/stores/${storeSlug}/payments/razorpay/create-order`, {
        method: "POST",
        body: JSON.stringify({ orderNumber: order.orderNumber }),
      });

      await loadRazorpayScript();

      openRazorpayCheckout({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: currentStore.name,
        order_id: razorpayOrder.razorpayOrderId,
        prefill: { name: form.shippingName, contact: form.shippingPhone },
        handler: async (response) => {
          try {
            await apiFetch(`/stores/${storeSlug}/payments/razorpay/verify`, {
              method: "POST",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            router.push(`/store/${storeSlug}/orders/${order.orderNumber}/confirmation`);
          } catch (err) {
            setError(
              err instanceof Error
                ? `Payment completed but could not be verified: ${err.message}`
                : "Payment completed but could not be verified.",
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Your order is saved — you can retry from your order history.");
          },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout. Please log in first.");
      setLoading(false);
    }
  }

  const subtotal = cartSummary
    ? cartSummary.items.reduce((sum, i) => sum + Number(i.priceAtAdd) * i.quantity, 0)
    : 0;
  const discountAmount = Number(cartSummary?.discountAmount) || 0;
  const total = subtotal - discountAmount;

  return (
    <>
      {store && <PageHeaderBanner title="Checkout" storeSlug={store.slug} storeName={store.name} current="Checkout" />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-6">Billing details</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              {savedAddresses.length > 0 && (
                <div>
                  <Field label="Use a saved address">
                    <Select
                      onChange={(e) => {
                        const address = savedAddresses.find((a) => a.id === Number(e.target.value));
                        if (address) applyAddress(address);
                      }}
                      defaultValue={savedAddresses.find((a) => a.isDefault)?.id ?? savedAddresses[0]?.id}
                    >
                      {savedAddresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label || a.recipientName} — {a.city}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Link href={`/store/${storeSlug}/account/addresses`} className="inline-block mt-1 text-sm text-primary hover:underline">
                    Manage addresses
                  </Link>
                </div>
              )}

              <Field label="Full name *">
                <Input value={form.shippingName} onChange={update("shippingName")} required />
              </Field>
              <Field label="Address *">
                <Input value={form.shippingLine1} onChange={update("shippingLine1")} required placeholder="House number, street name" />
              </Field>
              <Field label="Address line 2 (optional)">
                <Input value={form.shippingLine2} onChange={update("shippingLine2")} />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Town/City *">
                  <Input value={form.shippingCity} onChange={update("shippingCity")} required />
                </Field>
                <Field label="State *">
                  <Input value={form.shippingState} onChange={update("shippingState")} required />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Postcode/Zip *">
                  <Input value={form.shippingPostalCode} onChange={update("shippingPostalCode")} required />
                </Field>
                <Field label="Country *">
                  <Input value={form.shippingCountry} onChange={update("shippingCountry")} required />
                </Field>
              </div>
              <Field label="Mobile *">
                <Input type="tel" value={form.shippingPhone} onChange={update("shippingPhone")} required />
              </Field>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardBody className="space-y-3">
                  {cartSummary?.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm gap-4">
                      <span className="text-foreground">
                        {item.variant.product.name} <span className="text-muted-foreground">× {item.quantity}</span>
                      </span>
                      <span className="text-foreground shrink-0">₹{(Number(item.priceAtAdd) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({cartSummary?.couponCode})</span>
                      <span>−₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-foreground">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>

                  <p className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Lock className="h-3.5 w-3.5" />
                    Secure payment via Razorpay — you&apos;ll be prompted to pay after placing the order.
                  </p>

                  {error && <p className="rounded-md bg-destructive/10 text-destructive text-sm p-3">{error}</p>}

                  <Button type="submit" disabled={loading} className="w-full" size="lg">
                    {loading ? "Opening payment…" : "Place Order"}
                  </Button>
                </CardBody>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
