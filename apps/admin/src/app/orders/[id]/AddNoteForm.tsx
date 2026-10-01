"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

export default function AddNoteForm({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/orders/${orderId}/notes`, {
        method: "POST",
        body: JSON.stringify({ note: note.trim() }),
      });
      setNote("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" className="px-2.5 py-1 text-xs" onClick={() => setOpen(true)}>
        Add note
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        autoFocus
        rows={2}
        placeholder="Write a note…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="text-xs"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="px-2.5 py-1 text-xs">
          {loading ? "Saving…" : "Save note"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="px-2.5 py-1 text-xs"
          onClick={() => {
            setOpen(false);
            setNote("");
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
