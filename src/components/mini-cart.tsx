import { formatCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, selectCartSubtotal, selectCartCount } from "@/lib/cart-store";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function MiniCart() {
  const items = useCart((s) => s.lines);
  const count = useCart(selectCartCount);
  const total = useCart(selectCartSubtotal);
  const setIsDrawerOpen = useCart((s) => s.setIsDrawerOpen);
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {count >= 3 && (
        <motion.div
          key="mini-cart"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2"
        >
          <div className="flex w-72 flex-col overflow-hidden rounded-[24px] bg-white/90 p-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/5 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-100/50 pb-3 mb-3">
              <div className="flex -space-x-2">
                {items.slice(0, 3).map((item, i) => (
                  <div key={item.product.id} className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-slate-50 shadow-sm" style={{ zIndex: 10 - i }}>
                    <img src={item.product.images[0]} alt="" className="h-full w-full object-contain mix-blend-multiply p-1" />
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-100 shadow-sm text-xs font-semibold text-slate-500 z-0">
                    +{items.length - 3}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</div>
                <div className="text-lg font-semibold text-[#2C2C2E]">{formatCurrency(total)}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
              >
                View Cart
              </button>
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate({ to: "/checkout" });
                }}
                className="flex flex-[1.5] items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 transition-colors hover:bg-emerald-600 active:scale-95"
              >
                Checkout <ChevronRight className="size-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

