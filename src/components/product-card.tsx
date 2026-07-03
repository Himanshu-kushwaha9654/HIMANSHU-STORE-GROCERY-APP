import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-store";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  return (
    <div className="group flex flex-col">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden rounded-3xl bg-secondary ring-1 ring-black/5 transition-colors group-hover:bg-muted"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            {product.tag}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            add(product);
          }}
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-background text-foreground shadow-soft ring-1 ring-black/5 transition-transform active:scale-90"
        >
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </Link>
      <div className="mt-3 min-w-0 px-1">
        <Link
          to="/products/$id"
          params={{ id: product.id }}
          className="block truncate text-sm font-semibold text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {product.subtitle}
        </p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold">${product.price.toFixed(2)}</span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.compareAt.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
