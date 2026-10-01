"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface StoreRow {
  id: number;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function PlatformStoreTable({ stores }: { stores: StoreRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function toggleStatus(store: StoreRow) {
    setLoadingId(store.id);
    try {
      const nextStatus = store.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await apiFetch(`/platform/stores/${store.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Slug</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              <td className="px-5 py-3 font-medium text-slate-900">{store.name}</td>
              <td className="px-5 py-3 text-slate-600">{store.slug}</td>
              <td className="px-5 py-3">
                <Badge tone={store.status === "ACTIVE" ? "green" : "red"}>{store.status}</Badge>
              </td>
              <td className="px-5 py-3 text-slate-500">{new Date(store.createdAt).toLocaleDateString()}</td>
              <td className="px-5 py-3 text-right">
                <Button
                  variant={store.status === "ACTIVE" ? "danger" : "secondary"}
                  onClick={() => toggleStatus(store)}
                  disabled={loadingId === store.id}
                >
                  {store.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
