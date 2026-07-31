import { Link } from "@tanstack/react-router";
import { Home, Compass, ShoppingCart, Heart, User } from "lucide-react";
import { useCart, selectCartCount } from "@/lib/cart-store";

import { LayoutGrid, Printer, ShoppingBag, ArrowUpRight, Bell } from "lucide-react";
import { useNotificationStore } from "@/lib/notification-store";

export function MobileNav() {
  const count = useCart(selectCartCount);
  const openNotification = useNotificationStore(s => s.open);
  const unreadCount = useNotificationStore(s => s.notifications.filter(n => !n.read).length);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:hidden">
      <nav className="mx-auto flex h-[72px] items-center justify-between rounded-full bg-white/95 px-2 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5">
        
        {/* Home */}
        <Link
          to="/"
          className="group relative flex h-[56px] w-[72px] flex-col items-center justify-center gap-1 rounded-full transition-all [&.active]:bg-[#fdf4e3] [&.active]:text-[#2C2C2E] text-muted-foreground hover:text-[#2C2C2E]"
        >
          <Home className="size-6 transition-transform group-hover:scale-110" strokeWidth={2} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </Link>
        
        {/* Order Again */}
        <Link
          to="/products"
          className="group relative flex h-[56px] w-[72px] flex-col items-center justify-center gap-1 rounded-full transition-all [&.active]:bg-[#fdf4e3] [&.active]:text-[#2C2C2E] text-muted-foreground hover:text-[#2C2C2E]"
        >
          <ShoppingBag className="size-6 transition-transform group-hover:scale-110" strokeWidth={2} />
          <span className="text-[10px] font-bold tracking-tight">Order Again</span>
        </Link>

        {/* Categories */}
        <Link
          to="/cart"
          className="group relative flex h-[56px] w-[72px] flex-col items-center justify-center gap-1 rounded-full transition-all [&.active]:bg-[#fdf4e3] [&.active]:text-[#2C2C2E] text-muted-foreground hover:text-[#2C2C2E]"
        >
          <div className="relative">
            <LayoutGrid className="size-6 transition-transform group-hover:scale-110" strokeWidth={2} />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Categories</span>
        </Link>

        {/* Wishlist */}
        <Link
          to="/wishlist"
          className="group relative flex h-[56px] w-[72px] flex-col items-center justify-center gap-1 rounded-full transition-all [&.active]:bg-[#fdf4e3] [&.active]:text-[#2C2C2E] text-muted-foreground hover:text-[#2C2C2E]"
        >
          <div className="relative">
            <Heart className="size-6 transition-transform group-hover:scale-110" strokeWidth={2} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Wishlist</span>
        </Link>

        {/* Zomato */}
        <Link
          to="/"
          className="group relative flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#f43f5e] text-white shadow-md transition-transform hover:scale-105 active:scale-95 ml-1"
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold tracking-wide mb-0.5">zomato</span>
            <ArrowUpRight className="size-3" strokeWidth={3} />
          </div>
        </Link>
      </nav>
    </div>
  );
}

