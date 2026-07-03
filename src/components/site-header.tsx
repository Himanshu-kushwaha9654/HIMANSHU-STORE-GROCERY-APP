import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart, selectCartCount } from "@/lib/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const count = useCart(selectCartCount);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  const initial = (user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md ring-1 ring-black/5">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">
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
          <Link to="/products" className="hidden text-sm font-medium hover:text-primary sm:inline">
            Shop
          </Link>

          {!loading && (
            user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-pop"
                  aria-label="Account menu"
                >
                  {initial}
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-card shadow-pop ring-1 ring-black/5">
                    <div className="border-b border-border px-4 py-3">
                      <div className="truncate text-sm font-semibold">
                        {user.user_metadata?.full_name || "Zest member"}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <Link
                      to="/_authenticated/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted"
                    >
                      <User className="size-4" /> Your profile
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-muted"
                    >
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden h-10 items-center rounded-full bg-secondary px-4 text-sm font-semibold ring-1 ring-black/5 hover:bg-muted sm:inline-flex"
              >
                Sign in
              </Link>
            )
          )}

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
