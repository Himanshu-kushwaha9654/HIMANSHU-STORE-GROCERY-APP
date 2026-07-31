import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, selectCartCount, selectCartSubtotal } from "@/lib/cart-store";
import { ShoppingBag, ChevronRight, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatCurrency } from "@/lib/currency";

export function MiniShoppingBasket() {
  const count = useCart(selectCartCount);
  const subtotal = useCart(selectCartSubtotal);
  const lines = useCart((s) => s.lines);
  const setIsDrawerOpen = useCart((s) => s.setIsDrawerOpen);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Show basket only when count >= 3
  useEffect(() => {
    if (count >= 3) {
      setIsVisible(true);
      setIsMinimized(false);
    } else {
      setIsVisible(false);
    }
  }, [count]);

  // Auto minimize after 4 seconds
  useEffect(() => {
    if (isVisible && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isMinimized, count]); // Reset timer if count changes

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence mode="wait">
        {!isMinimized ? (
          <motion.div
            key="expanded-basket"
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="w-80 rounded-[24px] bg-white/90 p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <span className="font-bold text-[#2C2C2E]">Your Basket</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                  {count} items
                </span>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {lines.slice(-4).map((line) => (
                <div key={line.product.id} className="relative h-14 w-14 shrink-0 rounded-xl bg-slate-50 p-1 ring-1 ring-slate-100">
                  <img src={line.product.images[0]} alt={line.product.name} className="h-full w-full object-contain mix-blend-multiply" />
                  {line.qty > 1 && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-white">
                      {line.qty}
                    </div>
                  )}
                </div>
              ))}
              {lines.length > 4 && (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-xs font-bold text-slate-400 ring-1 ring-slate-100">
                  +{lines.length - 4}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm font-semibold text-slate-500">Subtotal</span>
              <span className="text-lg font-bold text-[#2C2C2E]">{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsMinimized(true)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:bg-emerald-600 transition-colors"
              >
                Checkout <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized-bubble"
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDrawerOpen(true)}
            className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] ring-1 ring-black/5"
          >
            <div className="absolute inset-1 rounded-full bg-emerald-50 transition-colors group-hover:bg-emerald-100" />
            <ShoppingBag className="relative z-10 h-6 w-6 text-emerald-600" />
            <div className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
              {count}
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

