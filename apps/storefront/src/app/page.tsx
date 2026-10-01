import { ShoppingBag } from "lucide-react";

export default function RootPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Vertex</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Visit a store at <code>/store/&lt;store-slug&gt;</code> to browse its catalog.
        </p>
      </div>
    </div>
  );
}
