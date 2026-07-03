import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop fresh groceries — Zest" },
      {
        name: "description",
        content:
          "Browse organic produce, bakery, dairy, and pantry — delivered in under 15 minutes.",
      },
    ],
  }),
  component: ProductsPage,
});

const SORTS = ["Popular", "Price ↑", "Price ↓", "Rating"] as const;

function ProductsPage() {
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Popular");

  const list = useMemo(() => {
    let items =
      category === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === category);
    items = [...items];
    if (sort === "Price ↑") items.sort((a, b) => a.price - b.price);
    if (sort === "Price ↓") items.sort((a, b) => b.price - a.price);
    if (sort === "Rating") items.sort((a, b) => b.rating - a.rating);
    return items;
  }, [category, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Shop everything
        </h1>
        <p className="mt-2 text-muted-foreground">
          {list.length} items · delivered in under 15 minutes
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {["All", ...CATEGORIES.map((c) => c.name)].map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/5 transition-colors ${
              category === c
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort
        </span>
        {SORTS.map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              sort === s
                ? "bg-foreground text-background"
                : "bg-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
