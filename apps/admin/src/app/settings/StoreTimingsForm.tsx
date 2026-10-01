"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

interface DayTiming {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

function defaultTimings(): DayTiming[] {
  return DAYS.map((d) => ({ day: d.value, isOpen: true, openTime: "09:00", closeTime: "18:00" }));
}

export default function StoreTimingsForm() {
  const [timings, setTimings] = useState<DayTiming[]>(defaultTimings());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch("/store/settings")
      .then((s: { storeTimings: DayTiming[] }) => {
        if (s.storeTimings && s.storeTimings.length === 7) {
          setTimings(
            s.storeTimings.map((t) => ({
              day: t.day,
              isOpen: t.isOpen,
              openTime: t.openTime ?? "09:00",
              closeTime: t.closeTime ?? "18:00",
            })),
          );
        }
      })
      .catch(() => {});
  }, []);

  function update(day: string, patch: Partial<DayTiming>) {
    setTimings((prev) => prev.map((t) => (t.day === day ? { ...t, ...patch } : t)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await apiFetch("/store/settings/timings", {
        method: "PATCH",
        body: JSON.stringify({ timings }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save store timings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="font-medium text-slate-900">Store timings</p>
        <p className="text-xs text-slate-500">Weekly opening hours, shown on your storefront.</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {DAYS.map((d) => {
            const t = timings.find((x) => x.day === d.value)!;
            return (
              <div key={d.value} className="flex items-center gap-3 text-sm">
                <label className="flex w-32 shrink-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.isOpen}
                    onChange={(e) => update(d.value, { isOpen: e.target.checked })}
                  />
                  <span className="text-slate-700">{d.label}</span>
                </label>
                {t.isOpen ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={t.openTime}
                      onChange={(e) => update(d.value, { openTime: e.target.value })}
                    />
                    <span className="text-slate-400">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={t.closeTime}
                      onChange={(e) => update(d.value, { closeTime: e.target.value })}
                    />
                  </div>
                ) : (
                  <span className="text-slate-400">Closed</span>
                )}
              </div>
            );
          })}

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Saved.</p>}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save store timings"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
