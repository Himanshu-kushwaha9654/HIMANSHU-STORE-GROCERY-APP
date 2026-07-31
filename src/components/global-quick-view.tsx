import { formatCurrency } from "@/lib/currency";
import { toast } from 'sonner';
import { useWishlist } from '@/lib/wishlist-store';
import { 
  X, Minus, Plus, Star, Heart, Clock, ShieldCheck, 
  Leaf, Info, ArrowRightLeft, Share, ChevronLeft, ChevronRight,
  TrendingUp, Award, Zap, ChevronDown
} from 'lucide-react';
import { 
  motion, useMotionValue, useSpring, useTransform, AnimatePresence, useScroll, wrap 
} from 'framer-motion';
import { DB, type Product } from '@/lib/enterprise-data';
import { useCart } from '@/lib/cart-store';
import { useQuickView } from '@/lib/quick-view-store';
import { ProductService } from '@/lib/services/product-service';
import { ProductCard } from './product-card';
import { useFlyToCart } from './fly-to-cart-provider';
import { useState, useEffect, useRef } from 'react';
import { PremiumCarousel } from '@/components/ui/premium-carousel';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

function RollingNumber({ value }: { value: number }) {
  return (
    <div className="relative h-8 w-8 overflow-hidden flex items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center font-bold text-[#2C2C2E] text-xl"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function Accordion({ title, children, icon: Icon, defaultOpen = false }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <span className="font-bold text-[#2C2C2E] flex items-center gap-3">
          <Icon className="size-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          {title}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <ChevronDown className="size-5 text-slate-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="pt-4 text-slate-600 text-sm leading-relaxed font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function GlobalQuickView() {
  const { activeProduct, setActiveProduct } = useQuickView();
  return (
    <AnimatePresence>
      {activeProduct && (
        <QuickViewContent 
          product={activeProduct} 
          onClose={() => setActiveProduct(null)} 
        />
      )}
    </AnimatePresence>
  );
}

function QuickViewContent({ product, onClose }: { product: any, onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const triggerPulse = useCart((s) => s.triggerPulse);
  const { triggerFlyToCart } = useFlyToCart();
  const [isAdding, setIsAdding] = useState(false);
  const { has, toggle } = useWishlist();
  const isSaved = has(product.id);
  
  // Frequently Bought Together
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  useEffect(() => {
    ProductService.getFrequentlyBoughtTogether(product.id).then(setRelatedProducts);
  }, [product.id]);
  
  // Image Gallery State
  const [[page, direction], setPage] = useState([0, 0]);
  
  // Create an array of 5 images by repeating the available ones
  const allImages = Array.from({length: 5}, (_, i) => product.images[i % product.images.length]);
  
  const imageIndex = wrap(0, allImages.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  // Parallax setup for the image
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(springX, [-0.5, 0.5], ["-10deg", "10deg"]);
  const shadowScale = useTransform(springY, [-0.5, 0.5], [1.1, 0.9]);
  
  // Lens zoom state
  const [isZooming, setIsZooming] = useState(false);
  const lensX = useTransform(springX, [-0.5, 0.5], ["0%", "100%"]);
  const lensY = useTransform(springY, [-0.5, 0.5], ["0%", "100%"]);

  // Scroll listener for sticky bar
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollRef });
  const [showStickyBar, setShowStickyBar] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} — Himanshu Store`,
      text: `Check out ${product.name} on Himanshu Store!`,
      url: `${window.location.origin}/products/${product.id}`,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Product link copied to clipboard!');
    }
  };

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest > 0.15) setShowStickyBar(true);
      else setShowStickyBar(false);
    });
  }, [scrollYProgress]);

  // Reset qty when product changes
  useEffect(() => {
    if (product) {
      setQty(1);
      setPage([0, 0]);
    }
  }, [product]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page]);
  const discount = product?.compareAt 
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100) 
    : 0;
  const savings = product?.compareAt ? (product.compareAt - product.price) * qty : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsZooming(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8,
    })
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Animated Glass Blur Background */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-slate-900/60 pointer-events-auto"
            onClick={onClose}
          >
             {/* Floating ambient lights - optimized to radial gradients without blur */}
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #10b981 0%, transparent 70%)' }} />
             <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #eab308 0%, transparent 70%)' }} />
          </motion.div>

          {/* Main Modal Container */}
          <motion.div
            layoutId={`product-card-${product.id}`}
            className="relative z-10 w-[96vw] max-w-[1200px] h-[92vh] max-h-[850px] bg-white shadow-2xl rounded-[40px] overflow-hidden flex flex-col md:flex-row pointer-events-auto border border-slate-100"
            style={{ originY: 0.5, originX: 0.5 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          >
            
            {/* STICKY PURCHASE BAR */}
            <AnimatePresence>
              {showStickyBar && (
                <motion.div 
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-0 left-0 right-0 z-[55] bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm p-4 hidden md:flex items-center justify-between pl-8 pr-24"
                >
                  <div className="flex items-center gap-4">
                    <img src={product.images[0]} className="w-12 h-12 object-contain mix-blend-multiply rounded-lg bg-slate-50 border border-slate-100" />
                    <div>
                      <h3 className="font-semibold text-[#2C2C2E] text-sm">{product.name}</h3>
                      <p className="font-bold text-slate-500 text-xs">{formatCurrency(product.price)} / {product.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl shadow-inner border border-slate-200/50">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors"
                        >
                          <Minus className="size-4" />
                        </motion.button>
                        <RollingNumber value={qty} />
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => setQty(q => q + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors"
                        >
                          <Plus className="size-4" />
                        </motion.button>
                    </div>
                    <motion.button
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       onClick={(e) => {
                         triggerFlyToCart(e, product, () => { add(product, qty); triggerPulse(); });
                       }}
                       className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors"
                    >
                       Add • {formatCurrency((product.price * qty))}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left Side: Massive Immersive Gallery (55%) */}
            <div className="relative w-full md:w-[55%] h-[40vh] md:h-full bg-gradient-to-br from-slate-50 to-slate-200/50 p-4 md:p-8 flex flex-col justify-between overflow-hidden">
              
              {/* Dynamic Floating Background Text */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
                 {[
                   { text: "HIMANSHU", color: "text-yellow-400", size: "text-5xl", top: "15%", left: "10%", delay: 0, duration: 25 },
                   { text: "STORE", color: "text-emerald-500", size: "text-7xl", top: "45%", left: "60%", delay: 2, duration: 30 },
                   { text: "FRESH", color: "text-yellow-500", size: "text-6xl", top: "75%", left: "15%", delay: 5, duration: 28 },
                   { text: "GROCERY", color: "text-emerald-400", size: "text-5xl", top: "20%", left: "70%", delay: 1, duration: 35 },
                   { text: "PREMIUM", color: "text-slate-300", size: "text-8xl", top: "80%", left: "50%", delay: 3, duration: 32 },
                   { text: "HIMANSHU", color: "text-yellow-400/60", size: "text-9xl", top: "50%", left: "5%", delay: 4, duration: 40 },
                   { text: "STORE", color: "text-emerald-500/60", size: "text-6xl", top: "10%", left: "35%", delay: 6, duration: 22 },
                 ].map((item, i) => (
                    <div 
                      key={i}
                      className={`absolute font-bold tracking-tighter select-none ${item.color} ${item.size}`}
                      style={{ top: item.top, left: item.left }}
                    >
                      {item.text}
                    </div>
                 ))}
              </div>
              
             <div className="relative flex justify-between items-center z-50">
                 <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm text-sm font-bold tracking-widest text-slate-500 border border-white flex items-center gap-2">
                    {imageIndex + 1} / {allImages.length}
                 </div>
                 <button 
                   onClick={onClose}
                   className="md:hidden bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-slate-500"
                 >
                   <X className="size-5" />
                 </button>
              </div>

              <div className="relative flex-1 flex items-center justify-center perspective-1000">
                <button 
                  onClick={() => paginate(-1)}
                  className="absolute left-0 z-50 p-3 bg-white/50 hover:bg-white backdrop-blur-xl border border-white rounded-full shadow-lg text-slate-600 hover:text-[#2C2C2E] transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="size-6" />
                </button>

                <motion.div
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={handleMouseLeave}
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                  className="relative w-full h-full max-h-[500px] flex items-center justify-center group cursor-zoom-in"
                >
                  {/* Dynamic Floating Shadow */}
                  <motion.div 
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/15 blur-2xl rounded-[100%]"
                    style={{ scale: shadowScale }}
                  />

                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      key={page}
                      src={allImages[imageIndex]}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate={{
                        ...slideVariants.center,
                        filter: isZooming ? "blur(12px)" : "blur(0px)",
                      }}
                      exit="exit"
                      transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                        filter: { duration: 0.3 }
                      }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) paginate(1);
                        else if (swipe > swipeConfidenceThreshold) paginate(-1);
                      }}
                      className="absolute w-[80%] h-[80%] object-contain mix-blend-multiply z-10 will-change-transform"
                      style={{ transform: "translateZ(30px)" }}
                    />
                  </AnimatePresence>

                  {/* Premium Hover Zoom Lens Effect */}
                  <AnimatePresence>
                    {isZooming && (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.8 }}
                         className="absolute inset-0 z-20 pointer-events-none rounded-[40px] overflow-hidden bg-white shadow-2xl"
                       >
                          <motion.div 
                            className="w-full h-full bg-no-repeat"
                            style={{ 
                              backgroundImage: `url(${allImages[imageIndex]})`,
                              backgroundPositionX: lensX,
                              backgroundPositionY: lensY,
                              backgroundSize: '250%'
                            }}
                          />
                       </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <button 
                  onClick={() => paginate(1)}
                  className="absolute right-0 z-50 p-3 bg-white/50 hover:bg-white backdrop-blur-xl border border-white rounded-full shadow-lg text-slate-600 hover:text-[#2C2C2E] transition-all hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-3 md:gap-4 mt-4 z-50"
              >
                {allImages.map((img, i) => {
                  const isActive = i === imageIndex;
                  return (
                    <button 
                      key={i} 
                      onClick={() => setPage([i, i > imageIndex ? 1 : -1])}
                      className="relative size-16 md:size-20 rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 group outline-none"
                    >
                      <motion.div 
                         animate={{ 
                           opacity: isActive ? 1 : 0, 
                           scale: isActive ? 1 : 0.8 
                         }}
                         className="absolute inset-[-4px] rounded-[20px] bg-gradient-to-tr from-emerald-400 to-teal-300 blur-sm opacity-50"
                      />
                      <motion.div
                         animate={{
                           borderColor: isActive ? '#10b981' : 'rgba(255, 255, 255, 0)',
                           scale: isActive ? 1.05 : 1
                         }}
                         className="absolute inset-0 rounded-2xl border-2 bg-white overflow-hidden flex items-center justify-center z-10"
                      >
                         <img src={img} className="w-[80%] h-[80%] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      </motion.div>
                    </button>
                  );
                })}
              </motion.div>
            </div>

            {/* Right Side: Product Details (45%) */}
            <div className="relative w-full md:w-[45%] h-[60vh] md:h-full flex flex-col bg-white border-l border-slate-100">
              
              <div className="hidden md:flex justify-end p-6 shrink-0 absolute top-0 right-0 z-[60] pointer-events-none">
                 <button 
                   onClick={onClose}
                   className="pointer-events-auto rounded-full p-3 bg-white/80 backdrop-blur hover:bg-white shadow-md border border-slate-100 hover:scale-110 transition-all text-slate-500 hover:text-[#2C2C2E] active:scale-95 group"
                 >
                   <X className="size-5 group-hover:rotate-90 transition-transform duration-300" />
                 </button>
              </div>

              <motion.div 
                ref={scrollRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex-1 overflow-y-auto px-6 md:px-10 pt-12 pb-48 no-scrollbar scroll-smooth"
              >
                
                {/* Premium Badges */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-4">
                   <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                     {DB.brands.findById(product.brandId)?.name || "Himanshu Store"}
                   </div>
                   <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      <Award className="size-3" /> Bestseller
                   </div>
                   {product.isOrganic && (
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                        <Leaf className="size-3" /> Organic
                      </div>
                   )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <motion.h2 
                    layoutId={`product-title-${product.id}`}
                    className="text-4xl md:text-5xl font-bold text-[#2C2C2E] tracking-tight leading-[1.1]"
                  >
                    {product.name}
                  </motion.h2>
                  <p className="text-lg font-bold text-slate-400 mt-2">{product.weight} {product.unit}</p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mt-6">
                   <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl shadow-sm hover:scale-105 transition-transform cursor-pointer">
                      <Star className="size-4 text-yellow-400" fill="currentColor" />
                      <span className="text-sm font-bold text-white">{product.rating.toFixed(1)}</span>
                   </div>
                   <span className="text-sm font-bold text-slate-400 hover:text-emerald-500 cursor-pointer underline decoration-slate-200 underline-offset-4 transition-colors">
                      {product.reviews} verified reviews
                   </span>
                   <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl shadow-sm border border-emerald-100">
                      <Zap className="size-4 text-emerald-500" fill="currentColor" />
                      {product.deliveryTime || "10 MINS"}
                   </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-inner relative overflow-hidden group">
                   
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                   
                   <div className="flex items-end justify-between relative z-10">
                     <div className="flex flex-col leading-none">
                        {product.compareAt && (
                           <span className="text-xl text-slate-400 line-through font-bold mb-2 flex items-center gap-2">
                              {formatCurrency(product.compareAt)}
                              {discount > 0 && (
                                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-lg text-xs font-bold no-underline tracking-wider">
                                  -{discount}%
                                </span>
                              )}
                           </span>
                        )}
                        <motion.span 
                          layoutId={`product-price-${product.id}`}
                          className="text-6xl font-bold text-[#2C2C2E] tracking-tighter"
                        >
                           {formatCurrency(product.price)}
                        </motion.span>
                     </div>
                     
                     <AnimatePresence>
                       {savings > 0 && (
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] flex flex-col items-center justify-center transform rotate-3"
                         >
                            <span className="text-xs font-bold uppercase tracking-widest opacity-90">You Save</span>
                            <span className="text-xl font-bold">{formatCurrency(savings)}</span>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                </motion.div>

                <motion.p variants={itemVariants} className="mt-8 text-lg text-slate-600 leading-relaxed font-medium">
                  {product.description}
                </motion.p>
                
                {/* Premium Information Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-8">
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3 group hover:border-emerald-200 transition-colors">
                     <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="size-5" />
                     </div>
                     <div>
                       <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Quality</h5>
                       <p className="font-bold text-[#2C2C2E] text-sm">100% Checked</p>
                     </div>
                   </div>
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3 group hover:border-blue-200 transition-colors">
                     <div className="p-2 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                       <TrendingUp className="size-5" />
                     </div>
                     <div>
                       <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Origin</h5>
                       <p className="font-bold text-[#2C2C2E] text-sm">{product.country || "Product of India"}</p>
                     </div>
                   </div>
                </motion.div>

                {/* Expandable Accordion Sections */}
                <motion.div variants={itemVariants} className="mt-8">
                   <Accordion title="Nutrition Facts" icon={Info} defaultOpen={true}>
                     Per 100g: Calories 42kcal, Total Fat 0.2g, Potassium 190mg, Carbohydrates 9g, Protein 1g, Vitamin C 88%. This product is highly nutritious and sourced fresh.
                   </Accordion>
                   <Accordion title="Storage & Usage" icon={Leaf}>
                         Store in a cool, dry place away from direct sunlight. For prolonged freshness, keep refrigerated in a perforated bag. Wash thoroughly before use.
                   </Accordion>
                   <Accordion title="Delivery Information" icon={Clock}>
                     Delivered within 10-15 minutes using our hyper-local dark store network. Quality is guaranteed upon arrival. Check contents before accepting delivery.
                   </Accordion>
                 </motion.div>

                 {/* AI Recommendations & Frequently Bought Together */}
                 {relatedProducts.length > 0 && (
                   <motion.div variants={itemVariants} className="mt-10 mb-8 border-t border-slate-100 pt-8">
                     <PremiumCarousel
                       title={<><Zap className="size-5 text-indigo-500" /> Frequently Bought Together</>}
                       subtitle="Smart AI Recommendations"
                       items={relatedProducts}
                       autoPlay={true}
                       showPagination={false}
                       viewportClassName="-mx-4 px-4"
                       containerClassName="gap-4"
                       options={{ slidesToScroll: 1, dragFree: true }}
                       renderItem={(p) => (
                         <div key={p.id} className="flex-[0_0_160px] md:flex-[0_0_180px] pointer-events-auto">
                           <div className="h-full">
                             <ProductCard product={p} />
                           </div>
                         </div>
                       )}
                     />
                   </motion.div>
                 )}

              </motion.div>

              {/* Massive Sticky Action Bar (Bottom) */}
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100/80 p-6 md:p-8 flex flex-col gap-4 shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.1)] z-20"
              >
                 <div className="flex items-center gap-4">
                   {/* Apple-style Segmented Quantity Selector */}
                   <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl shadow-inner border border-slate-200/50">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors"
                      >
                        <Minus className="size-6" />
                      </motion.button>
                      <div className="w-12 text-center">
                        <RollingNumber value={qty} />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQty(q => q + 1)}
                        className="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-sm font-bold text-slate-700 hover:text-emerald-500 transition-colors"
                      >
                        <Plus className="size-6" />
                      </motion.button>
                   </div>
                   
                   <motion.button
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={(e) => {
                       if(isAdding) return;
                       setIsAdding(true);
                       triggerFlyToCart(e, product, () => {
                         add(product, qty);
                         triggerPulse();
                       });
                       setTimeout(() => {
                         setIsAdding(false);
                         onClose();
                       }, 800);
                     }}
                     className="relative flex-1 bg-slate-900 text-white h-[72px] rounded-2xl font-bold flex items-center justify-center gap-3 overflow-hidden group shadow-[0_20px_40px_-10px_rgba(15,23,42,0.5)] transition-all hover:shadow-[0_20px_50px_-10px_rgba(16,185,129,0.6)] hover:bg-emerald-500"
                   >
                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                     
                     <span className="text-xl tracking-wide">Add to Cart</span>
                     <span className="text-xl opacity-50">•</span>
                     <span className="text-xl">{formatCurrency((product.price * qty))}</span>
                   </motion.button>
                 </div>
                 
                 <div className="flex justify-center gap-6 mt-2">
                    <button 
                      onClick={() => {
                        toggle(product.id);
                        if (!isSaved) toast.success('Saved to wishlist');
                        else toast.info('Removed from wishlist');
                      }}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors group ${isSaved ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
                    >
                      <Heart className={`size-4 transition-transform group-hover:scale-125 ${isSaved ? 'fill-rose-500' : ''}`} /> 
                      {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
                    </button>
                    <button 
                      onClick={handleShare}
                      className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors group"
                    >
                      <Share className="size-4 group-hover:scale-125 transition-transform" /> Share Product
                    </button>
                  </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
  );
}

