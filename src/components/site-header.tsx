import { Link } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, User } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/cart-store";

export function SiteHeader() {
  const count = useCart(selectCartCount);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md ring-1 ring-black/5">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-primary"
          >
            Zest<span className="text-foreground">.</span>
          </Link>
          <div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-1.5 ring-1 ring-black/5 lg:flex">
            <MapPin className="size-4 shrink-0 text-primary" />
            <span className="text-xs font-medium">Brooklyn, NY · 15 min</span>
          </div>
        </div>

        <div className="hidden md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search organic produce…"
              className="h-10 w-full rounded-full bg-secondary pl-10 pr-4 text-sm outline-none ring-1 ring-black/5 transition-shadow focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/products"
            className="hidden text-sm font-medium hover:text-primary sm:inline"
          >
            Shop
          </Link>
          <button className="hidden size-10 items-center justify-center rounded-full bg-secondary text-foreground ring-1 ring-black/5 hover:bg-muted sm:flex">
            <User className="size-4" />
          </button>
          <Link
            to="/cart"
            className="relative flex h-10 items-center gap-2 rounded-full bg-primary pl-3 pr-4 text-sm font-semibold text-primary-foreground shadow-pop transition-transform active:scale-95"
          >
            <ShoppingBag className="size-4" />
            <span>Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
              {count}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
