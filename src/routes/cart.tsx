import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart, selectCartSubtotal } from "@/lib/cart-store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [{ title: "Your cart — Zest" }],
  }),
  component: CartPage,
});

function CartPage() {
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(selectCartSubtotal);
  const delivery = subtotal > 0 ? 2.99 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + delivery + tax;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-secondary text-muted-foreground">
          <ShoppingBag className="size-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Fresh picks are only a tap away.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-pop"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Your cart
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={line.product.id}
              className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl bg-card p-4 shadow-soft ring-1 ring-black/5 sm:grid-cols-[96px_minmax(0,1fr)_auto_auto]"
            >
              <img
                src={line.product.image}
                alt={line.product.name}
                className="size-20 rounded-2xl object-cover sm:size-24"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{line.product.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {line.product.subtitle}
                </p>
                <p className="mt-1 text-sm font-bold">
                  ${line.product.price.toFixed(2)}
                </p>
              </div>
              <div className="col-span-3 flex items-center justify-between gap-3 sm:col-span-1">
                <div className="flex items-center gap-1 rounded-full bg-secondary p-1 ring-1 ring-black/5">
                  <button
                    onClick={() => setQty(line.product.id, line.qty - 1)}
                    className="grid size-8 place-items-center rounded-full hover:bg-background"
                    aria-label="Decrease"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">
                    {line.qty}
                  </span>
                  <button
                    onClick={() => setQty(line.product.id, line.qty + 1)}
                    className="grid size-8 place-items-center rounded-full hover:bg-background"
                    aria-label="Increase"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => remove(line.product.id)}
                className="hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive sm:grid"
                aria-label="Remove"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-3xl bg-card p-6 shadow-soft ring-1 ring-black/5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
            <Row label="Delivery" value={`$${delivery.toFixed(2)}`} />
            <Row label="Tax" value={`$${tax.toFixed(2)}`} />
            <div className="border-t border-border pt-3">
              <Row label="Total" value={`$${total.toFixed(2)}`} bold />
            </div>
          </dl>
          <button className="mt-6 w-full rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-pop transition-transform active:scale-95">
            Checkout
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Estimated delivery in 12–15 minutes
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-bold" : "text-muted-foreground"}>{label}</dt>
      <dd className={bold ? "text-lg font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}
