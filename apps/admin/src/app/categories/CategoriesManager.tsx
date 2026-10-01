"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import EmptyState from "@/components/EmptyState";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function load() {
    apiFetch("/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/categories", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", slug: "" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditForm({ name: category.name, slug: category.slug });
  }

  async function saveEdit(id: number) {
    setError(null);
    try {
      await apiFetch(`/categories/${id}`, { method: "PATCH", body: JSON.stringify(editForm) });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  }

  async function remove(id: number) {
    setError(null);
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create one below to start organizing products." />
      ) : (
        <Card>
          <ul>
            {categories.map((c) => (
              <li key={c.id} className="border-b border-slate-100 px-5 py-3 last:border-0">
                {editingId === c.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      className="max-w-[180px]"
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      className="max-w-[180px]"
                      value={editForm.slug}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                    />
                    <Button onClick={() => saveEdit(c.id)}>Save</Button>
                    <Button variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-900">{c.name}</span>
                      <span className="ml-2 text-sm text-slate-500">{c.slug}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => startEdit(c)}>
                        Edit
                      </Button>
                      <Button variant="ghost" onClick={() => remove(c.id)} className="text-red-600 hover:bg-red-50">
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader>
          <p className="font-medium text-slate-900">New category</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Name">
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                required
              />
            </Field>
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create category"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
