import { Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Search, ShoppingBag, User, LogOut, ChevronRight, Map, Mic, ScanLine, Sparkles, Bell, Heart, Ticket, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, selectCartCount } from "@/lib/cart-store";
import { useSearchStore } from "@/lib/search-store";
import { useNotificationStore } from "@/lib/notification-store";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/lib/services/auth-service";
import { toast } from "sonner";
import { Logo } from "@/components/ui/logo";
import { useAddressStore } from "@/lib/address-store";
import { useProfileStore } from "@/lib/profile-store";

export function SiteHeader() {
  const count = useCart(selectCartCount);
  const setIsDrawerOpen = useCart((s) => s.setIsDrawerOpen);
  const cartPulse = useCart((s) => s.cartPulse);
  const { user, loading } = useAuth();
  const setIsSearchOpen = useSearchStore(s => s.setIsOpen);
  const setIsAiShoppingOpen = useSearchStore(s => s.setIsAiShoppingOpen);
  const unreadNotificationsCount = useNotificationStore(s => s.notifications.filter(n => !n.isRead).length);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [magnetActive, setMagnetActive] = useState(false);
  const { defaultAddress, setIsPickerOpen } = useAddressStore();
  const profile = useProfileStore(s => s.profile);

  useEffect(() => {
    const handleMagnet = (e: any) => setMagnetActive(e.detail.active);
    document.addEventListener("cart-magnet-pull", handleMagnet);
    return () => document.removeEventListener("cart-magnet-pull", handleMagnet);
  }, []);

  const handleLocationClick = () => {
    setIsPickerOpen(true);
  };
  const menuRef = useRef<HTMLDivElement>(null);

  // Slide-up placeholder effect state
  const SUGGESTIONS = ["milk", "paneer", "vegetables", "healthy snacks", "protein", "fruits"];
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isFocused || inputValue) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isFocused, inputValue]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    await AuthService.signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  const initial = (user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-navbar/90 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all">
      <div className="mx-auto grid h-16 max-w-[1750px] w-[96%] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          {!loading && (
            user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-pop transition-transform hover:scale-105 active:scale-95 overflow-hidden"
                  aria-label="Account menu"
                >
                  {profile?.avatarDataUrl ? (
                    <img src={profile.avatarDataUrl} alt="Avatar" className="size-full object-cover" />
                  ) : (
                    initial
                  )}
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="absolute left-0 mt-3 w-56 overflow-hidden rounded-[20px] bg-popover shadow-pop ring-1 ring-black/5 z-50 origin-top-left"
                    >
                      <div className="border-b border-border/40 bg-secondary/30 px-4 py-3">
                        <div className="truncate text-sm font-bold text-foreground">
                          {user.user_metadata?.full_name || "Himanshu Store Member"}
                        </div>
                        <div className="truncate text-[11px] font-medium text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        >
                          <User className="size-4" /> Profile Dashboard
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        >
                          <ShoppingBag className="size-4" /> My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-rose-500 transition-colors"
                        >
                          <Heart className="size-4" /> Wishlist
                        </Link>
                        <Link
                          to="/rewards"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-500 transition-colors"
                        >
                          <Sparkles className="size-4" /> Rewards Hub
                        </Link>
                        <Link
                          to="/addresses"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                        >
                          <MapPin className="size-4" /> Saved Addresses
                        </Link>
                      </div>
                      <div className="border-t border-border/40 py-1">
                        <Link
                          to="/settings"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Settings className="size-4" /> Settings
                        </Link>
                      </div>
                      <button
                        onClick={signOut}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="flex size-10 items-center justify-center rounded-full bg-secondary/80 text-foreground ring-1 ring-black/5 hover:bg-secondary transition-colors cursor-pointer shadow-sm">
                <User className="size-5" />
              </Link>
            )
          )}
          <Link to="/" className="hidden sm:block hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 rounded-lg p-1 -ml-1">
            <Logo size="sm" layout="horizontal" />
          </Link>
          <button 
            className="hidden md:flex items-center gap-2 hover:bg-[#F3F4F6] p-2 rounded-xl transition-colors cursor-pointer"
            onClick={handleLocationClick}
          >
            <MapPin className="size-5 shrink-0 text-primary" />
            <span className="text-sm font-semibold text-[#1A1A1A] line-clamp-1 max-w-[150px]">
              {defaultAddress ? `${defaultAddress.line1}` : "Add Delivery Address"}
            </span>
          </button>
        </div>

        <div className="hidden md:flex flex-1 justify-center px-6">
          <motion.div 
            layoutId="search-bar-container"
            className="relative w-full max-w-[440px] h-[52px] rounded-full bg-background/40 backdrop-blur-md text-left outline-none ring-1 ring-[#16A34A]/10 hover:ring-[#16A34A]/30 transition-all flex items-center group shadow-[inset_0_2px_10px_rgba(255,255,255,0.8),_0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2),_0_4px_15px_rgba(0,0,0,0.2)] cursor-text"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest('.ai-button')) {
                setIsSearchOpen(true);
              }
            }}
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-400 transition-colors group-hover:text-[#16A34A] z-10" />
            
            <div className="absolute left-[52px] top-0 bottom-0 right-[60px] flex items-center overflow-hidden z-10 text-slate-500 text-[15px] font-medium">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={suggestionIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  Search "{SUGGESTIONS[suggestionIndex]}"
                </motion.span>
              </AnimatePresence>
            </div>
            
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
              <motion.button
                className="ai-button relative flex items-center justify-center size-[42px] rounded-full bg-background/60 backdrop-blur-md border border-[#16A34A]/20 shadow-[0_4px_12px_rgba(22,163,74,0.15)] text-[#16A34A] overflow-hidden group/ai z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAiShoppingOpen(true);
                }}
                whileHover={{ 
                  scale: 1.08, 
                  boxShadow: "0 8px 25px rgba(22,163,74,0.3)",
                  borderColor: "rgba(22,163,74,0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 4px 12px rgba(22,163,74,0.15)",
                    "0 4px 25px rgba(22,163,74,0.4)",
                    "0 4px 12px rgba(22,163,74,0.15)"
                  ]
                }}
                transition={{
                  boxShadow: { repeat: Infinity, duration: 2, repeatDelay: 3 }
                }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -5, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 3.5 }}
                  className="relative z-10"
                >
                  <Sparkles className="size-[20px] group-hover/ai:rotate-[15deg] transition-transform duration-300" />
                </motion.div>
                
                {/* Tiny glowing particles for idle effect */}
                <motion.div 
                  className="absolute inset-0 bg-[#16A34A]/10 rounded-full"
                  animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/products" className="hidden text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all hover:scale-110 active:scale-95 sm:inline">
            Shop
          </Link>

          <Link to="/notifications" className="relative p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 rounded-full transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
            <Bell className="size-[22px]" />
            <AnimatePresence>
              {unreadNotificationsCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1 right-1 size-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"
                />
              )}
            </AnimatePresence>
          </Link>


          <motion.button
            onClick={() => setIsDrawerOpen(true)}
            id="navbar-cart-icon"
            key={cartPulse} // Re-animate on pulse
            initial={{ scale: 1, x: 0, y: 0 }}
            animate={cartPulse > 0 ? {
              scale: [1, 1.2, 0.8, 1.1, 1], // Stretches out!
              rotate: [0, -10, 10, -5, 0],
              x: [0, -4, 4, 0],
              y: [0, 4, -4, 0],
              transition: { duration: 0.7, ease: "easeInOut" }
            } : magnetActive ? {
              x: -5,
              y: 5,
              scale: 1.05,
              boxShadow: "0 0 25px rgba(16,185,129,0.6)",
              transition: { type: "spring", stiffness: 300, damping: 20 }
            } : {
              x: 0, y: 0, scale: 1, boxShadow: "0 4px 14px rgba(16,185,129,0.2)"
            }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px rgba(16,185,129,0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-11 items-center gap-2.5 rounded-2xl bg-emerald-500 pl-4 pr-5 text-sm font-bold text-white transition-all"
          >
            <ShoppingBag className="size-4.5" />
            <span className="hidden sm:inline">Cart</span>
            
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={`badge-${count}-${cartPulse}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.35, 0.92, 1], opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6, times: [0, 0.4, 0.7, 1], ease: "easeInOut" }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white border-2 border-white shadow-sm"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
