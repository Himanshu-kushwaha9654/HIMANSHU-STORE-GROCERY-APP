import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Star, Clock, Leaf } from "lucide-react";

export function PremiumPromoBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Setup Parallax for background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // Stagger variants for text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  // Floating animation variant
  const floatVariant = (delay: number, duration: number) => ({
    animate: {
      y: [0, -10, 0],
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }
    }
  });

  // Leaves animation variant
  const leafVariant = (delay: number, duration: number, rotate: number[]) => ({
    animate: {
      y: [0, -40, 0],
      x: [0, 20, 0],
      rotate,
      transition: {
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }
    }
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div 
        ref={containerRef}
        className="relative w-full rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-slate-900 min-h-[500px] flex items-center"
      >
        {/* Parallax Background Image */}
        <motion.div 
          className="absolute inset-0 z-0"
          style={{ y: yBg }}
        >
          <img 
            src="/hero-bg.png" 
            alt="Premium Groceries" 
            className="w-full h-[130%] object-cover object-[70%_top] -top-[15%] relative"
          />
        </motion.div>

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/40 to-black/10"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Ambient Glow */}
        <div className="absolute inset-0 z-10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] rounded-[32px] pointer-events-none"></div>

        {/* Floating Leaves / Particles */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <motion.div variants={leafVariant(0, 8, [0, 45, 0])} animate="animate" className="absolute top-[10%] left-[45%] opacity-30 blur-[2px]">
             <Leaf className="w-12 h-12 text-emerald-400" />
          </motion.div>
          <motion.div variants={leafVariant(2, 12, [0, -60, 0])} animate="animate" className="absolute bottom-[20%] left-[55%] opacity-20 blur-[4px] scale-150">
             <Leaf className="w-16 h-16 text-emerald-300" />
          </motion.div>
          <motion.div variants={leafVariant(1, 9, [45, 90, 45])} animate="animate" className="absolute top-[30%] right-[10%] opacity-40 blur-[1px] scale-75">
             <Leaf className="w-10 h-10 text-emerald-500" />
          </motion.div>
        </div>

        {/* Content Container */}
        <div className="relative z-30 w-full px-6 py-16 sm:px-12 md:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Side: Text & Buttons */}
          <motion.div 
            className="w-full lg:w-1/2 max-w-xl"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] tracking-tight mb-6 text-shadow-sm"
            >
              Everything Fresh.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-[#84cc16]">
                Delivered in Minutes.
              </span>
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-200 mb-10 leading-relaxed opacity-90 max-w-md"
            >
              Discover premium groceries, farm-fresh vegetables, daily essentials and exclusive offers delivered to your doorstep.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/products" className="group relative overflow-hidden bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-[0_8px_30px_rgba(5,150,105,0.4)] transition-all hover:-translate-y-1 active:translate-y-0">
                <span className="relative z-10 flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Gloss sweep effect */}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
              </Link>
              
              <Link to="/products" className="group relative overflow-hidden bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold transition-all hover:bg-white/20 hover:-translate-y-1 active:translate-y-0">
                <span className="relative z-10">Explore Categories</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Floating Cards */}
          <div className="w-full lg:w-1/2 relative h-[350px] md:h-[400px] hidden md:block">
             
             {/* Flash Sale Card (Top Right) */}
             <motion.div 
               variants={floatVariant(0, 6)}
               animate="animate"
               className="absolute top-4 right-4 z-30 bg-white/10 backdrop-blur-xl border border-white/30 p-5 rounded-3xl shadow-2xl min-w-[200px]"
             >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs mb-3 border border-amber-400/30">
                  <Zap className="w-3.5 h-3.5 fill-current" /> FLASH SALE
                </div>
                <h4 className="text-2xl font-semibold text-white mb-1 tracking-tight">Up to <span className="text-amber-400">40%</span></h4>
                <p className="text-sm text-slate-300 font-medium">OFF on Fresh Veggies</p>
             </motion.div>

             {/* Rating Card (Bottom Left) */}
             <motion.div 
               variants={floatVariant(1.5, 7)}
               animate="animate"
               className="absolute bottom-12 left-10 z-20 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 min-w-[180px]"
             >
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-xl font-bold text-[#2C2C2E] tracking-tight">4.9/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-600 font-bold">25K+ Reviews</span>
                </div>
             </motion.div>

             {/* Delivery Card (Bottom Right) */}
             <motion.div 
               variants={floatVariant(3, 5)}
               animate="animate"
               className="absolute bottom-4 right-12 z-40 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-4 rounded-2xl shadow-2xl flex items-center gap-4"
             >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Clock className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-tight">Delivery in</span>
                  <span className="text-xl font-bold text-emerald-400 tracking-tight">10 Mins</span>
                </div>
             </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}

