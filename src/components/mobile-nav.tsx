import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/cart-store";
import { useNotificationStore } from "@/lib/notification-store";

export function MobileNav() {
  const count = useCart(selectCartCount);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Helper to determine active state exactly
  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-slate-100 pb-safe pb-2">
      <nav className="flex items-center justify-around h-16 px-1">
        
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Home className={`size-[22px] ${isActive("/") ? "fill-emerald-600/20" : ""}`} strokeWidth={isActive("/") ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-tight">Home</span>
        </Link>
        
        {/* Categories */}
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/products") || isActive("/category") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <LayoutGrid className={`size-[22px] ${isActive("/products") || isActive("/category") ? "fill-emerald-600/20" : ""}`} strokeWidth={isActive("/products") || isActive("/category") ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-tight">Categories</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/cart") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <div className="relative">
            <ShoppingCart className={`size-[22px] ${isActive("/cart") ? "fill-emerald-600/20" : ""}`} strokeWidth={isActive("/cart") ? 2.5 : 2} />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Cart</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/wishlist") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Heart className={`size-[22px] ${isActive("/wishlist") ? "fill-emerald-600/20" : ""}`} strokeWidth={isActive("/wishlist") ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-tight">Wishlist</span>
        </Link>

        {/* Profile */}
        <Link
          to="/_authenticated/profile"
          className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive("/_authenticated/profile") ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <User className={`size-[22px] ${isActive("/_authenticated/profile") ? "fill-emerald-600/20" : ""}`} strokeWidth={isActive("/_authenticated/profile") ? 2.5 : 2} />
          <span className="text-[10px] font-semibold tracking-tight">Profile</span>
        </Link>
        
      </nav>
    </div>
  );
}

