import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Minus, Heart, Clock, Star, Eye, ArrowRightLeft, Loader2 } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/enterprise-data";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { useFlyToCart } from "./fly-to-cart-provider";
import { useState } from "react";
import { useQuickView } from "@/lib/quick-view-store";
import { AnimatedHeart } from "./ui/animated-heart";
import { DB } from "@/lib/enterprise-data";
import { formatCurrency } from "@/lib/currency";
import { Magnetic } from "./ui/magnetic";

export function ProductCard({ product: initialProduct }: { product: Product }) {
  // Product fallback
  const product = initialProduct || DB.products.findMany({ limit: 1 })[0];
  
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const lines = useCart((s) => s.lines);
  const triggerPulse = useCart((s) => s.triggerPulse);
  const cartItem = lines?.find((l) => l.product.id === product.id);
  const { triggerFlyToCart } = useFlyToCart();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  const setActiveProduct = useQuickView((s) => s.setActiveProduct);

  if (!product) return null;

  // Image fallback
  const categoryProducts = DB.products.findMany({ categoryId: product.categoryId });
  const validImages = categoryProducts.flatMap(p => p.images || []).filter(img => img);
  const displayImage = (product.images && product.images[0]) || validImages[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80";

  const brand = DB.brands.findById(product.brandId);
  const category = DB.categories.findById(product.categoryId);

  // 3D Hover Effect setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  // Calculate discount percentage
  const discount = product.compareAt 
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) 
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      data-cursor="product"
      onClick={() => setActiveProduct(product)}
      className="product-card-container w-full text-left relative flex flex-col rounded-[24px] bg-white p-3 ring-1 ring-slate-100 cursor-pointer outline-none"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ 
          scale: 1.03, 
          y: -8,
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)",
        }}
        initial={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* Glossy sweep effect on hover */}
      <div className="absolute inset-0 rounded-[24px] overflow-hidden pointer-events-none z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 w-[150%] h-[150%] -translate-x-full -translate-y-full opacity-0"
          whileHover={{
            translateX: ["-100%", "50%"],
            translateY: ["-100%", "50%"],
            opacity: [0, 1, 0],
            transition: { duration: 1, ease: "easeInOut" }
          }}
        />
      </div>

      {/* Top badges layer */}
      <div 
        className="absolute left-3 top-3 right-3 z-20 flex justify-between items-start pointer-events-none"
        style={{ transform: "translateZ(30px)" }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 rounded-md bg-white/80 px-2 py-1 backdrop-blur-md shadow-sm border border-slate-100">
            <Clock className="size-3 text-emerald-600" />
            <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-tighter">
              {product.deliveryTime || "8 MINS"}
            </span>
          </div>
          {discount > 0 && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-md px-2 py-1 w-fit shadow-md">
              <span className="text-[10px] font-semibold text-white uppercase tracking-tighter">
                {discount}% OFF
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Quick Actions on Hover */}
      <motion.div 
        className="absolute right-3 top-3 z-30 flex flex-col gap-2 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1, pointerEvents: "auto" }}
        style={{ transform: "translateZ(40px)" }}
      >
        <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors border border-slate-100 flex items-center justify-center">
          <AnimatedHeart productId={product.id} className="size-4" />
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); /* Compare logic */ toast.info("Added to compare"); }}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100"
        >
          <ArrowRightLeft className="size-4" />
        </button>

        <Link
          to="/products/$id"
          params={{ id: product.id }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors border border-slate-100 flex items-center justify-center"
        >
          <Eye className="size-4" />
        </Link>
      </motion.div>

      {/* Product Image */}
      <div 
        className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-slate-50 mb-3 mt-6 mx-2 group/img"
        style={{ transform: "translateZ(20px)" }}
      >
        <motion.img
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          src={displayImage}
          alt={product.name || "Product Image"}
          loading="lazy"
          className="h-full w-full object-contain mix-blend-multiply p-4 group-hover/img:scale-110 transition-transform duration-500"
        />
      </div>
      
      {/* Product Details */}
      <div 
        className="flex flex-1 flex-col px-2"
        style={{ transform: "translateZ(10px)" }}
      >
        <div className="flex items-center justify-between mb-1">
           <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{brand?.name || "Premium Brand"}</span>
           <div className="flex items-center gap-0.5">
             <Star className="size-3 fill-amber-400 text-amber-400" />
             <span className="text-[10px] font-semibold text-slate-700">{product.rating?.toFixed(1) || "4.8"}</span>
             <span className="text-[10px] text-slate-400 font-medium">({product.reviews || 327})</span>
           </div>
        </div>

        <motion.div 
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="line-clamp-2 text-sm font-semibold leading-snug text-[#2C2C2E] group-hover:text-emerald-600 transition-colors h-[40px]"
        >
          {product.name || "Premium Product"}
        </motion.div>
        
        <p className="mt-1.5 text-xs font-semibold text-slate-400 truncate">
          {product.weight || "250"} {product.unit || "g"} • {category?.name || "Groceries"}
        </p>
        
        <div className="mt-auto pt-4 flex items-center justify-between pointer-events-auto">
          <div className="flex flex-col leading-none">
            {product.compareAt && (
              <span className="mb-0.5 text-[11px] font-semibold text-slate-400 line-through">
                {formatCurrency(product.compareAt)}
              </span>
            )}
            <motion.span 
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="text-base font-semibold text-[#2C2C2E]"
            >
              {formatCurrency(product.price || 0)}
            </motion.span>
          </div>
          
          <Magnetic maxPull={8}>
            {cartItem ? (
              <div className="flex items-center justify-between bg-emerald-50 text-emerald-600 rounded-xl h-9 w-[80px] px-1 shadow-sm border border-emerald-100">
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    if (cartItem.qty > 1) setQty(product.id, cartItem.qty - 1);
                    else remove(product.id); 
                  }}
                  className="size-7 flex items-center justify-center hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{cartItem.qty}</span>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    setQty(product.id, cartItem.qty + 1); 
                  }}
                  className="size-7 flex items-center justify-center hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={isAdding ? { scale: 0.95, boxShadow: "0 0 15px rgba(16,185,129,0.5)" } : { scale: 1, boxShadow: "none" }}
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isAdding) return;
                  
                  // Create ripple
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const id = Date.now();
                  setRipples(prev => [...prev, { x, y, id }]);
                  
                  setIsAdding(true);
                  
                  // Brief loading spinner
                  await new Promise(r => setTimeout(r, 150));
                  
                  setIsAdding(false);
                  setRipples(prev => prev.filter(r => r.id !== id));
                  
                  // Pass the event target's rect instead of the event itself
                  triggerFlyToCart(e, product, () => {
                    add(product);
                    triggerPulse();
                  });
                }}
                className="relative overflow-hidden flex h-9 w-[72px] items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-600 shadow-sm border border-emerald-100 transition-colors hover:bg-emerald-500 hover:text-white"
              >
                <AnimatePresence mode="wait">
                  {isAdding ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Loader2 className="size-4 animate-spin text-emerald-600" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      ADD
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Ripples */}
                <AnimatePresence>
                  {ripples.map(ripple => (
                    <motion.span
                      key={ripple.id}
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ left: ripple.x, top: ripple.y }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/20 size-12 pointer-events-none"
                    />
                  ))}
                </AnimatePresence>
              </motion.button>
            )}
          </Magnetic>
        </div>
      </div>
    </motion.div>
  );
}

