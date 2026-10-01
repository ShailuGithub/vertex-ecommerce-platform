"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Input";

const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Ekart", "XpressBees", "India Post", "FedEx", "Other"];

export default function ShipOrderForm({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"SELF" | "COURIER">("SELF");
  const [addTracking, setAddTracking] = useState(false);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [customCourier, setCustomCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showTrackingFields = method === "COURIER" || addTracking;
  const courierName = courier === "Other" ? customCourier.trim() : courier;

  function reset() {
    setMethod("SELF");
    setAddTracking(false);
    setCourier(COURIERS[0]);
    setCustomCourier("");
    setTrackingNumber("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (method === "COURIER" && !courierName) {
      setError("Enter a courier name");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/orders/${orderId}/ship`, {
        method: "POST",
        body: JSON.stringify({
          shippingMethod: method,
          courierName: showTrackingFields ? courierName || undefined : undefined,
          trackingNumber: showTrackingFields ? trackingNumber.trim() || undefined : undefined,
        }),
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ship order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-orange-500 hover:bg-orange-600"
      >
        Ship order
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Ship order via</h2>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  reset();
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 ${
                    method === "COURIER" ? "border-brand-500 ring-1 ring-brand-500" : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    checked={method === "COURIER"}
                    onChange={() => setMethod("COURIER")}
                  />
                  <span className="text-sm font-medium text-slate-900">Courier partner</span>
                </label>

                <label
                  className={`flex cursor-pointer flex-col gap-2 rounded-lg border px-4 py-3 ${
                    method === "SELF" ? "border-brand-500 ring-1 ring-brand-500" : "border-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={method === "SELF"}
                      onChange={() => setMethod("SELF")}
                    />
                    <span className="text-sm font-medium text-slate-900">Self ship</span>
                  </span>
                  {method === "SELF" && (
                    <label className="ml-6 flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={addTracking}
                        onChange={(e) => setAddTracking(e.target.checked)}
                      />
                      Add tracking details
                    </label>
                  )}
                </label>
              </div>

              {showTrackingFields && (
                <div className="flex flex-col gap-3 border-t border-slate-100 pt-3">
                  <Field label="Shipping partner">
                    <Select value={courier} onChange={(e) => setCourier(e.target.value)}>
                      {COURIERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  {courier === "Other" && (
                    <Input
                      placeholder="Courier name"
                      value={customCourier}
                      onChange={(e) => setCustomCourier(e.target.value)}
                    />
                  )}
                  <Field label="Tracking ID">
                    <Input
                      placeholder="Enter the AWB number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Shipping…" : showTrackingFields ? "Add & ship order" : "Ship order"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
