"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card, { CardBody } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number | null;
  brand: string | null;
  category: { id: number; name: string };
}

export default function EditProductForm({ product, startInEdit }: { product: Product; startInEdit?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(Boolean(startInEdit));
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    basePrice: String(product.basePrice),
    compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : "",
    categoryId: String(product.category.id),
    brand: product.brand ?? "",
  });

  useEffect(() => {
    if (editing && categories.length === 0) {
      apiFetch("/categories")
        .then(setCategories)
        .catch(() => setCategories([]));
    }
  }, [editing, categories.length]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const updated = await apiFetch(`/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          basePrice: Number(form.basePrice),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
          categoryId: Number(form.categoryId),
          brand: form.brand || undefined,
        }),
      });
      setEditing(false);
      if (updated.slug !== product.slug) {
        router.push(`/products/${updated.slug}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    const hasDiscount = product.compareAtPrice != null && product.compareAtPrice > product.basePrice;
    const percentOff = hasDiscount
      ? Math.round((1 - product.basePrice / product.compareAtPrice!) * 100)
      : 0;

    return (
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{product.category?.name ?? "Uncategorized"}</span>
            <span>·</span>
            <span className="font-medium text-slate-900">₹{product.basePrice}</span>
            {hasDiscount && (
              <>
                <span className="text-slate-400 line-through">₹{product.compareAtPrice}</span>
                <Badge tone="green">{percentOff}% off</Badge>
              </>
            )}
          </div>
          {product.description && <p className="mt-3 max-w-2xl text-sm text-slate-600">{product.description}</p>}
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Edit product
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 max-w-2xl">
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={update("name")} required autoFocus />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={update("slug")} required />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={update("description")} rows={3} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Base price">
              <Input
                type="number"
                value={form.basePrice}
                onChange={update("basePrice")}
                required
                min={0}
                step="0.01"
              />
            </Field>
            <Field label="Compare-at price (optional)">
              <Input
                type="number"
                value={form.compareAtPrice}
                onChange={update("compareAtPrice")}
                min={0}
                step="0.01"
                placeholder="e.g. original MRP"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={form.categoryId} onChange={update("categoryId")} required>
                {categories.length === 0 && (
                  <option value={form.categoryId}>{product.category?.name ?? "Loading…"}</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Brand (optional)">
              <Input value={form.brand} onChange={update("brand")} />
            </Field>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
