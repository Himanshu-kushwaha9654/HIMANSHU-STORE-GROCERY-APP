import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { getProduct, PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-store";
import { ProductCard } from "@/components/product-card";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — Zest" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Zest` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — Zest` },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-primary">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);

  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id,
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-[32px] bg-secondary ring-1 ring-black/5">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-1 text-muted-foreground">{product.subtitle}</p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Star className="size-3.5" fill="currentColor" />
              {product.rating.toFixed(1)}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.reviews} reviews
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
            {product.compareAt && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.compareAt.toFixed(2)}
              </span>
            )}
          </div>

          <p className="mt-6 max-w-prose text-foreground/80">
            {product.description}
          </p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-secondary p-1 ring-1 ring-black/5">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-9 place-items-center rounded-full hover:bg-background"
                aria-label="Decrease"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid size-9 place-items-center rounded-full hover:bg-background"
                aria-label="Increase"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-pop transition-transform active:scale-95"
            >
              Add to cart · ${(product.price * qty).toFixed(2)}
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-xs">
            <div>
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="mt-1 font-semibold">Under 15 min</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Origin</dt>
              <dd className="mt-1 font-semibold">Local farms</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Returns</dt>
              <dd className="mt-1 font-semibold">Instant credit</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-6 text-2xl font-bold tracking-tight">
            You might also love
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
