import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/enterprise-data";
import { toast } from "sonner";
import { Check, Undo2 } from "lucide-react";
import { useCart } from "@/lib/cart-store";

type FlyingItem = {
  id: string;
  product: Product;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  height: number;
  archControl: number;
  rotation: number;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
  size: number;
  type: "sparkle" | "leaf" | "star";
};

type FlyToCartContextType = {
  triggerFlyToCart: (
    e: React.MouseEvent<HTMLElement> | MouseEvent | Event,
    product: Product,
    onComplete?: () => void
  ) => void;
};

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

export function useFlyToCart() {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error("useFlyToCart must be used within FlyToCartProvider");
  }
  return context;
}

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const remove = useCart((s) => s.remove);

  const createParticles = (x: number, y: number) => {
    const newParticles: Particle[] = Array.from({ length: 30 }).map((_, i) => ({
      id: Math.random().toString(36).substring(7),
      x,
      y,
      color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#fbbf24" : "#34d399",
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 80 + 40,
      size: Math.random() * 10 + 4,
      type: i % 4 === 0 ? "leaf" : i % 4 === 1 ? "star" : "sparkle",
    }));

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1500);
  };

  const showPremiumToast = (product: Product) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="flex w-80 items-center justify-between overflow-hidden rounded-[24px] bg-white/90 p-2 pr-4 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-1 ring-1 ring-slate-900/5 shadow-inner">
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-white"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </motion.div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Added to cart</span>
            <span className="line-clamp-1 text-sm font-bold text-[#2C2C2E] leading-tight">{product.name}</span>
            <span className="text-xs font-semibold text-slate-500">1x Qty</span>
          </div>
        </div>
        <button
          onClick={() => {
            remove(product.id);
            toast.dismiss(t);
            toast.info(`Removed ${product.name}`);
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 active:scale-95 shrink-0"
        >
          <Undo2 className="size-4" />
        </button>
      </motion.div>
    ), { duration: 3500, position: "bottom-right" });
  };

  const triggerFlyToCart = (
    e: React.MouseEvent<HTMLElement> | MouseEvent | Event,
    product: Product,
    onComplete?: () => void
  ) => {
    const cartIcon = document.getElementById("navbar-cart-icon");
    if (!cartIcon) {
      if (onComplete) onComplete();
      showPremiumToast(product);
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    
    // We use the event target to find the product image location
    let target = e.target as HTMLElement;
    const card = target.closest(".product-card-container") || target.closest(".hero-image-container");
    
    let startRect;
    if (card) {
      const img = card.querySelector("img");
      if (img) {
        startRect = img.getBoundingClientRect();
      } else {
        startRect = card.getBoundingClientRect();
      }
    } else {
      startRect = target.getBoundingClientRect();
    }

    const archControl = -(0.4 + Math.random() * 0.8); // Random arch height using bezier control point (negative means UP)
    const rotation = (180 + Math.random() * 180) * (Math.random() > 0.5 ? 1 : -1);

    const newItem: FlyingItem = {
      id: Math.random().toString(36).substring(7),
      product,
      startX: startRect.left,
      startY: startRect.top,
      endX: cartRect.left + cartRect.width / 2 - startRect.width / 10,
      endY: cartRect.top + cartRect.height / 2 - startRect.height / 10,
      width: startRect.width,
      height: startRect.height,
      archControl,
      rotation,
    };

    setFlyingItems((prev) => [...prev, newItem]);

    // Dispatch a custom event to the cart icon to simulate magnetic pull
    const magnetEvent = new CustomEvent('cart-magnet-pull', { detail: { active: true } });
    document.dispatchEvent(magnetEvent);

    // Total animation time is 800ms. Complete exactly at the end.
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
      createParticles(cartRect.left + cartRect.width / 2, cartRect.top + cartRect.height / 2);
      
      const releaseEvent = new CustomEvent('cart-magnet-pull', { detail: { active: false } });
      document.dispatchEvent(releaseEvent);

      showPremiumToast(product);
      if (onComplete) onComplete();
    }, 800); 
  };

  return (
    <FlyToCartContext.Provider value={{ triggerFlyToCart }}>
      {children}
      
      {/* Animation Portal */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{
                x: item.startX,
                y: item.startY,
                scale: 1,
                rotate: 0,
                filter: "blur(0px)",
                opacity: 1,
              }}
              animate={{
                x: item.endX,
                y: item.endY,
                scale: 0.15,
                rotate: item.rotation,
                filter: "blur(4px)",
                opacity: 0,
              }}
              transition={{
                duration: 0.8,
                x: { ease: "linear" }, 
                y: { ease: [0.5, item.archControl, 1, 1] }, // This bezier creates the flawless arc without stopping!
                scale: { ease: "easeInOut" },
                rotate: { ease: "linear" },
                filter: { ease: "easeIn" },
                opacity: { ease: "easeIn", duration: 0.7 },
              }}
              style={{
                position: "absolute",
                width: item.width,
                height: item.height,
                transformOrigin: "center center",
              }}
              className="will-change-transform"
            >
              <div className="relative h-full w-full">
                {/* Glossy sweep during flight */}
                <motion.div
                  className="absolute inset-0 z-20 rounded-[24px] overflow-hidden pointer-events-none"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/80 to-white/0 w-[200%] h-[200%] -translate-x-full -translate-y-full"
                    animate={{
                      translateX: ["-100%", "50%"],
                      translateY: ["-100%", "50%"],
                    }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>
                
                {/* Trailing Glow */}
                <motion.div
                  className="absolute inset-0 bg-emerald-400 blur-xl rounded-full z-0"
                  animate={{ opacity: [0, 0.8, 0], scale: [1, 1.5, 2] }}
                  transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                />

                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="relative z-10 h-full w-full object-contain rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] bg-white/90 backdrop-blur-xl ring-1 ring-slate-900/5"
                />
              </div>
            </motion.div>
          ))}

          {/* Particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: p.x,
                y: p.y,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: p.x + Math.cos(p.angle) * p.speed,
                y: p.y + Math.sin(p.angle) * p.speed + 40, // Add gravity
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
                rotate: p.type === "leaf" || p.type === "star" ? 360 : 0,
              }}
              transition={{
                duration: 1.0,
                ease: "easeOut",
              }}
              style={{
                position: "absolute",
                width: p.size,
                height: p.size,
                backgroundColor: p.type === "sparkle" ? p.color : "transparent",
                borderRadius: p.type === "sparkle" ? "50%" : "0",
              }}
              className="pointer-events-none will-change-transform z-[201]"
            >
              {p.type === "leaf" && (
                <svg viewBox="0 0 24 24" fill={p.color} className="h-full w-full drop-shadow-sm">
                  <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,8,17,8,17,8Z" />
                </svg>
              )}
              {p.type === "star" && (
                <svg viewBox="0 0 24 24" fill={p.color} className="h-full w-full drop-shadow-sm">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}

