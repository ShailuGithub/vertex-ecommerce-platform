"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Input";

interface Category {
  id: number;
  name: string;
}

export default function NewProductForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    compareAtPrice: "",
    categoryId: "",
    brand: "",
    sku: "",
    color: "",
    size: "",
    quantityOnHand: "0",
  });

  useEffect(() => {
    apiFetch("/categories")
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const attributes: Record<string, string> = {};
      if (form.color) attributes.color = form.color;
      if (form.size) attributes.size = form.size;

      const product = await apiFetch("/products", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          basePrice: Number(form.basePrice),
          compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
          categoryId: Number(form.categoryId),
          brand: form.brand || undefined,
          variants: [
            {
              sku: form.sku,
              attributes,
              quantityOnHand: Number(form.quantityOnHand) || 0,
            },
          ],
        }),
      });

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/uploads`,
          { method: "POST", credentials: "include", body: formData },
        );
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
          const variantId = product.variants[0].id;
          await apiFetch(`/products/variants/${variantId}/images`, {
            method: "POST",
            body: JSON.stringify({ url: uploadData.url, isPrimary: true }),
          });
        }
      }

      router.push("/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
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
                <option value="">Select category</option>
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

          <div className="mt-2 border-t border-slate-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">Default variant</p>
            <div className="flex flex-col gap-4">
              <Field label="SKU">
                <Input value={form.sku} onChange={update("sku")} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Color (optional)">
                  <Input value={form.color} onChange={update("color")} />
                </Field>
                <Field label="Size (optional)">
                  <Input value={form.size} onChange={update("size")} />
                </Field>
              </div>
              <Field label="Quantity on hand">
                <Input type="number" value={form.quantityOnHand} onChange={update("quantityOnHand")} min={0} />
              </Field>
              <Field label="Image (optional)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                />
              </Field>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
          <div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create product"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
