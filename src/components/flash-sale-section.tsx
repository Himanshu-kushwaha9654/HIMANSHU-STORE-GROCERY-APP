import { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, Star, ChevronLeft, ChevronRight, Flame, ArrowRight, Plus } from "lucide-react";
import { DB, Product } from "@/lib/enterprise-data";
import { useCart } from "@/lib/cart-store";
import { useFlyToCart } from "./fly-to-cart-provider";
import { formatCurrency } from "@/lib/currency";
import { Magnetic } from "./ui/magnetic";
import { PremiumCarousel } from "./ui/premium-carousel";

const BADGES = [
  { text: "🔥 Selling Fast", bg: "bg-orange-500/10", textC: "text-orange-400", border: "border-orange-500/20" },
  { text: "⚡ Flash Deal", bg: "bg-amber-500/10", textC: "text-amber-400", border: "border-amber-500/20" },
  { text: "⭐ Bestseller", bg: "bg-blue-500/10", textC: "text-blue-400", border: "border-blue-500/20" },
  { text: "🆕 New Arrival", bg: "bg-emerald-500/10", textC: "text-emerald-400", border: "border-emerald-500/20" },
  { text: "❤️ Customer Favorite", bg: "bg-rose-500/10", textC: "text-rose-400", border: "border-rose-500/20" },
  { text: "⚠ Only Few Left", bg: "bg-red-500/10", textC: "text-red-400", border: "border-red-500/20" },
  { text: "🎉 Festival Offer", bg: "bg-purple-500/10", textC: "text-purple-400", border: "border-purple-500/20" },
  { text: "🏆 Top Rated", bg: "bg-indigo-500/10", textC: "text-indigo-400", border: "border-indigo-500/20" },
];

const calculateTimeLeft = () => {
  const now = new Date();
  const target = new Date();
  target.setHours(18, 0, 0, 0); 
  if (now > target) target.setDate(target.getDate() + 1);

  const difference = target.getTime() - now.getTime();
  let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
  let minutes = Math.floor((difference / 1000 / 60) % 60);
  let seconds = Math.floor((difference / 1000) % 60);

  return {
    difference,
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
};

export function FlashSaleSection() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [products, setProducts] = useState<Product[]>([]);

  const add = useCart(s => s.add);
  const { triggerFlyToCart } = useFlyToCart();

  useEffect(() => {
    const flashItems = DB.products.findMany({ flashSale: true, limit: 12 });
    setProducts(flashItems.length > 0 ? flashItems : DB.products.findMany({ hasOffers: true, limit: 12 }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="deals" className="relative mx-auto max-w-[1750px] w-[96%] px-4 py-16 sm:px-6 overflow-hidden">
      {/* Container Background (Apple/Stripe/Linear inspired) */}
      <div 
        className="absolute inset-0 z-0 rounded-[32px] overflow-hidden" 
        style={{ background: 'linear-gradient(180deg, #0F172A 0%, #111827 100%)' }}
      >
        {/* Soft Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Subtle Dotted Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
        
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>
      </div>

      <div 
        className="relative z-10 rounded-[32px] p-6 sm:p-10 lg:p-14"
      >
        
        {/* Section Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12">
          {/* Top Left */}
          <div className="space-y-3 relative group cursor-pointer">
            {/* Soft radial green glow behind title */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[300px] h-[150px] bg-[#10B981]/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#10B981]/10 transition-colors duration-700" />
            
            <div className="flex items-center gap-3 relative z-10">
              <motion.div
                animate={{ 
                  scale: [1, 1.08, 1],
                  rotate: [0, 3, -3, 0],
                  filter: [
                    "drop-shadow(0 0 5px rgba(16,185,129,0.3))",
                    "drop-shadow(0 0 15px rgba(16,185,129,0.6))",
                    "drop-shadow(0 0 5px rgba(16,185,129,0.3))"
                  ]
                }}
                transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                className="relative flex items-center justify-center text-[#10B981] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] transition-all duration-300 transform-gpu"
              >
                <Zap className="size-10 sm:size-12 fill-current relative z-10" />
                
                {/* Electric Spark Effect */}
                <motion.div 
                  className="absolute inset-0 bg-white blur-[2px] rounded-full mix-blend-overlay z-20"
                  animate={{ opacity: [0, 0, 1, 0, 0], scale: [0.5, 0.5, 1.2, 1.5, 0.5] }}
                  transition={{ duration: 8, times: [0, 0.9, 0.92, 0.95, 1], repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl sm:text-5xl lg:text-6xl font-[800] tracking-[-0.5px] flex items-center gap-2 group-hover:brightness-110 transition-all duration-300"
              >
                <span className="text-[#FFFFFF]">FLASH</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#22C55E] to-[#10B981]">DEALS</span>
              </motion.h2>

              {/* LIVE Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="ml-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner"
              >
                <motion.div 
                  animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                />
                <span className="text-[10px] font-bold tracking-widest text-emerald-400">LIVE</span>
              </motion.div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
              className="text-base sm:text-lg text-[#CBD5E1] font-medium relative z-10 pl-2 group-hover:text-white transition-colors duration-300"
            >
              Premium offers available for a limited time
            </motion.p>
          </div>
          
          {/* Top Right */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 bg-[#172033] border border-white/10 rounded-2xl p-4 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 animate-[shimmer_2s_infinite]" />
              <div className="flex items-center gap-2 text-rose-400 font-bold mr-2">
                <Flame className="size-5 fill-rose-400 animate-pulse" />
                Ends in
              </div>
              <CountdownCell value={timeLeft.hours} label="Hours" />
              <span className="text-2xl font-bold text-slate-600 animate-pulse">:</span>
              <CountdownCell value={timeLeft.minutes} label="Minutes" />
              <span className="text-2xl font-bold text-slate-600 animate-pulse">:</span>
              <CountdownCell value={timeLeft.seconds} label="Seconds" />
            </motion.div>
            
            <Link to="/products" className="group flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              View All Deals 
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Product Cards Carousel */}
        <PremiumCarousel
          paginationId="activePill-FlashSale"
          viewportClassName="-mx-4 px-4 pb-4 pt-4"
          containerClassName="gap-4 md:gap-6"
          items={products}
          options={{
            slidesToScroll: 1,
            breakpoints: {
              '(min-width: 640px)': { slidesToScroll: 2 },
              '(min-width: 1024px)': { slidesToScroll: 4 }
            }
          }}
          renderItem={(p, idx) => (
            <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0">
               <FlashSaleProductCard 
                 product={p} 
                 index={idx}
                 onAdd={(e) => triggerFlyToCart(e, p, () => add(p))} 
               />
            </div>
          )}
        />
      </div>
    </section>
  );
}

function CountdownCell({ value, label }: { value: string, label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex size-12 items-center justify-center bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
        <span suppressHydrationWarning className="font-mono text-xl font-bold text-white">{value}</span>
      </div>
      <span className="mt-1 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
        {label}
      </span>
    </div>
  );
}

function FlashSaleProductCard({ product, index, onAdd }: { product: Product, index: number, onAdd: (e: React.MouseEvent<HTMLButtonElement>) => void }) {
  const stockRatio = product.stockQty / 100; // Assume 100 max
  const isVeryLowStock = product.stockQty < 15;
  const isLowStock = product.stockQty >= 15 && product.stockQty < 40;
  
  const barColor = isVeryLowStock ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : 'bg-emerald-500';
  const stockText = isVeryLowStock ? 'Only ' + product.stockQty + ' Left' : 'Claimed ' + (100 - product.stockQty) + '%';
  
  // Random badge assignment for demo purposes (using index to make it deterministic per render)
  const badge = BADGES[index % BADGES.length];

  return (
    <motion.div
      data-cursor="product"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: index * 0.1 } } }}
      whileHover="hover"
      className="group relative flex flex-col overflow-hidden rounded-[24px] bg-[#172033] p-5 border border-white/10 shadow-lg transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/20 hover:-translate-y-2 cursor-pointer"
    >
      {/* Border Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Random Premium Badge */}
      <div className="absolute top-4 left-4 z-20">
        <motion.div 
          className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border backdrop-blur-md shadow-sm ${badge.bg} ${badge.textC} ${badge.border}`}
          variants={{ hover: { y: -2, scale: 1.05 } }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {badge.text}
        </motion.div>
      </div>

      {/* White Image Container */}
      <div 
        className="relative aspect-square overflow-hidden rounded-[20px] bg-white mb-5 flex items-center justify-center p-6 shadow-inner z-10"
      >
        <motion.img
          src={product.images[0]}
          alt={product.name}
          className="w-[80%] h-[80%] object-contain drop-shadow-md"
          variants={{
            hover: { scale: 1.15, rotate: 3, y: -5 }
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />
      </div>

      <div className="flex flex-col flex-1 z-10 relative">
        {/* Brand & Delivery */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand || "Premium"}</span>
          <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-md">
            <Zap className="size-3 text-amber-400 fill-amber-400" /> 8 mins
          </span>
        </div>

        {/* Title */}
        <Link to="/products/$id" params={{ id: product.id }} className="text-lg font-bold text-white line-clamp-2 leading-snug mb-1 group-hover:text-emerald-300 transition-colors">
          {product.name}
        </Link>
        
        {/* Weight & Rating */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-slate-400 font-medium">{product.weight}</span>
          <div className="w-1 h-1 rounded-full bg-slate-600" />
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-300">{product.rating} <span className="text-slate-500 font-normal">({product.reviews})</span></span>
          </div>
        </div>

        <div className="mt-auto space-y-5">
          {/* Animated Stock Indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-bold">
              <motion.span 
                className={isVeryLowStock ? 'text-red-400' : isLowStock ? 'text-orange-400' : 'text-emerald-400'}
                variants={{ hover: { scale: 1.05, originX: 0 } }}
              >
                {stockText}
              </motion.span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                className={`h-full ${barColor} rounded-full`}
                initial={{ width: 0 }}
                whileInView={{ width: `${100 - stockRatio * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Price and Add Button */}
          <div className="flex items-end justify-between pt-4 border-t border-white/10">
            <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  {product.compareAt && (
                    <span className="text-[11px] font-bold text-slate-500 line-through decoration-slate-600">
                      {formatCurrency(product.compareAt)}
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="text-[11px] font-bold text-emerald-400">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {formatCurrency(product.price)}
                </span>
              </div>
            
            <Magnetic maxPull={8}>
              <motion.button
                variants={{
                  hover: { 
                    boxShadow: "0 0 20px rgba(16,185,129,0.4)",
                    scale: 1.05
                  }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  onAdd(e);
                }}
                className="relative overflow-hidden bg-gradient-to-b from-emerald-400 to-emerald-600 text-white size-10 rounded-xl shadow-lg flex items-center justify-center transition-all group/btn"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <Plus className="size-5 relative z-10" />
              </motion.button>
            </Magnetic>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
