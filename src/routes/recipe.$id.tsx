import { formatCurrency } from "@/lib/currency";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, Flame, Star, Play, CheckCircle2, Circle, ChevronDown, Heart, Share2, X, Sparkles, Utensils, Leaf, Users, Zap, ShieldCheck, Truck, Droplet, ArrowRight, ChevronLeft, ChevronRight, Info, AlertTriangle, Lightbulb } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/lib/cart-store";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { AutoCarousel } from '@/components/ui/auto-carousel';
import { DB } from "@/lib/enterprise-data";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { RecipeService } from "@/lib/services/recipe-service";

export const Route = createFileRoute("/recipe/$id")({
  loader: async ({ params }) => {
    const recipe = await RecipeService.getRecipeById(params.id);
    if (!recipe) {
      throw new Error(`Recipe with id ${params.id} not found`);
    }
    
    // Simple similar recipes logic (just grab some featured ones for now)
    const featured = await RecipeService.getFeaturedRecipes();
    const relatedRecipes = featured.filter(r => r.id !== recipe.id).slice(0, 4);

    return { recipe, relatedRecipes };
  },
  errorComponent: () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="size-12" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Recipe Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-md">We couldn't find the recipe you're looking for. It might have been removed or the URL is incorrect.</p>
        <Link to="/recipes" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
          Explore All Recipes
        </Link>
      </div>
    );
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const recipe = loaderData.recipe;
    return {
      meta: [
        { title: `${recipe.name} Recipe - Grocery App` },
        { name: "description", content: recipe.description },
        { property: "og:title", content: recipe.name },
        { property: "og:image", content: recipe.img },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Recipe",
            name: recipe.name,
            image: recipe.img,
            description: recipe.description,
            recipeYield: recipe.servings,
            nutrition: {
              "@type": "NutritionInformation",
              calories: `${recipe.nutrition.calories} kcal`,
            },
          }),
        },
      ],
    };
  },
  component: RecipePage,
});

const ImageWithFallback = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fallbackSrc = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  return (
    <motion.img 
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
      onLoad={() => setIsLoaded(true)}
      initial={{ filter: "blur(20px)", opacity: 0 }}
      animate={{ filter: isLoaded ? "blur(0px)" : "blur(20px)", opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className={className}
    />
  );
};

function RecipePage() {
  const { recipe, relatedRecipes } = Route.useLoaderData();
  const goBack = useNavigateBack();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [recipe.id]);

  const cartItems = useCart((s) => s.lines) || [];
  const addItem = useCart((s) => s.add);
  const setIsDrawerOpen = useCart((s) => s.setIsDrawerOpen);

  const [expandedStep, setExpandedStep] = useState<number>(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Dynamic Ingredients State
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [expandedSwap, setExpandedSwap] = useState<string | null>(null);

  // Parallax Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const parallaxX1 = useTransform(mouseX, [-1000, 1000], [40, -40]);
  const parallaxY1 = useTransform(mouseY, [-1000, 1000], [40, -40]);
  const parallaxX2 = useTransform(mouseX, [-1000, 1000], [-30, 30]);
  const parallaxY2 = useTransform(mouseY, [-1000, 1000], [-30, 30]);

  // Resolve products for ingredients
  const resolvedIngredients = recipe.ingredientsList ? recipe.ingredientsList.map((ing: any) => {
    const matches = DB.products.findMany({ search: ing.query });
    
    if (matches.length === 0) {
      return { ...ing, status: 'out_of_stock', matches: [], selectedProduct: null };
    }
    
    const selectedId = selectedVariants[ing.name] || matches[0].id;
    const selectedProduct = matches.find(m => m.id === selectedId) || matches[0];
    
    return {
      ...ing,
      status: 'available',
      matches,
      selectedProduct
    };
  }) : [];

  const missingIngredients = resolvedIngredients.filter((ing: any) => {
    if (ing.status !== 'available') return false;
    return !cartItems.some(item => item.product.id === ing.selectedProduct.id);
  });

  const missingTotal = missingIngredients.reduce((acc: number, ing: any) => acc + ((ing.selectedProduct?.price || 0) * ing.requiredQty), 0);

  const handleAddMissing = () => {
    missingIngredients.forEach((ing: any) => {
      if (ing.selectedProduct) {
        for (let i = 0; i < ing.requiredQty; i++) addItem(ing.selectedProduct);
      }
    });
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.8 }, colors: ['#10B981', '#34D399', '#ffffff', '#FDE047'] });
    toast.success("Added missing ingredients to cart!");
    setTimeout(() => setIsDrawerOpen(true), 800);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={recipe.id}
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: -10 }} 
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="min-h-[100dvh] bg-[#f8fafc] pb-32 font-sans overflow-x-hidden selection:bg-emerald-200"
      >

      {/* ======================================= */}
      {/* 1. CINEMATIC HERO SECTION */}
      {/* ======================================= */}
      <section className="relative w-full h-[700px] bg-[#0f172a] overflow-hidden flex items-center">
        {/* Background Ambient Blur */}
        <div className="absolute inset-0 z-0">
          <img src={recipe.img} alt="bg" className="w-full h-full object-cover opacity-20 blur-2xl scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
        </div>

        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
           <button onClick={() => goBack("/recipes")} className="size-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
             <ArrowLeft className="size-6" />
           </button>
           <div className="flex gap-3">
             <button onClick={() => setIsSaved(!isSaved)} className="size-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
               <Heart className={`size-6 transition-colors ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
             </button>
             <button className="size-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
               <Share2 className="size-5" />
             </button>
           </div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex-1 max-w-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
                <Sparkles className="size-3.5" /> AI Optimized
              </span>
              <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                <Star className="size-3.5 fill-amber-400" /> {recipe.rating}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
              {recipe.name}
            </h1>
            <p className="text-slate-300 text-lg font-medium leading-relaxed mb-8 max-w-lg">
              {recipe.description}
            </p>
            
            <div className="flex flex-wrap gap-4 md:gap-6 mb-10">
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <div className="size-10 bg-white/10 rounded-full flex items-center justify-center"><Clock className="size-5 text-emerald-400" /></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</span><span className="font-bold text-white text-lg leading-none">{recipe.time}</span></div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <div className="size-10 bg-white/10 rounded-full flex items-center justify-center"><Flame className="size-5 text-rose-400" /></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</span><span className="font-bold text-white text-lg leading-none">{recipe.calories}</span></div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                <div className="size-10 bg-white/10 rounded-full flex items-center justify-center"><Utensils className="size-5 text-blue-400" /></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</span><span className="font-bold text-white text-lg leading-none">{recipe.difficulty}</span></div>
              </div>
            </div>

            <button 
              onClick={() => setIsVideoOpen(true)}
              className="group relative inline-flex items-center gap-4 bg-white hover:bg-slate-50 text-[#2C2C2E] px-8 py-4 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <div className="size-10 bg-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <Play className="size-4 text-white ml-0.5 fill-white" />
              </div>
              Watch Masterclass
              <div className="absolute inset-0 rounded-full ring-2 ring-white/50 ring-offset-2 ring-offset-[#0f172a] scale-100 opacity-0 group-hover:animate-ping" />
            </button>
          </motion.div>

          {/* Right Content - Parallax Image */}
          <div className="hidden md:block relative flex-1 h-full w-full max-w-lg perspective-1000 z-20">
            {/* Soft glowing shadow behind the bowl */}
            <motion.div 
              style={{ x: parallaxX1, y: parallaxY1 }}
              className="absolute inset-4 rounded-[40px] bg-amber-500/20 blur-[60px]"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{ x: parallaxX1, y: parallaxY1 }}
              whileHover={{ scale: 1.03 }}
              className="relative z-20 w-full aspect-square rounded-[32px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/10 bg-slate-900"
            >
              <img src={recipe.img} alt={recipe.name} className="w-full h-full object-cover" />
              
              {/* Soft moving light reflection */}
              <motion.div 
                animate={{ x: ['-200%', '200%'] }} 
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                className="absolute inset-0 z-30 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
              />
              
              {/* Continuous steam particles */}
              <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: '60%', x: `${40 + (i * 5)}%`, scale: 0.8 }}
                    animate={{ 
                      opacity: [0, 0.3, 0], 
                      y: ['60%', '20%'], 
                      x: [`${40 + (i * 5)}%`, `${30 + (i * 10)}%`], 
                      scale: [0.8, 2] 
                    }}
                    transition={{ 
                      duration: 4 + (i % 3), 
                      repeat: Infinity, 
                      delay: i * 0.5, 
                      ease: "easeOut" 
                    }}
                    className="absolute w-24 h-24 bg-white/20 blur-[20px] rounded-full mix-blend-screen"
                  />
                ))}
              </div>
            </motion.div>
            
            {/* Floating Ingredients */}
            {[
              { icon: "🍅", x: parallaxX2, y: parallaxY2, top: "-10%", left: "80%", delay: 0, rotate: 15 },
              { icon: "🧈", x: parallaxY2, y: parallaxX1, top: "20%", left: "-10%", delay: 0.2, rotate: -15 },
              { icon: "🌿", x: parallaxX1, y: parallaxY2, top: "70%", left: "85%", delay: 0.4, rotate: 45 },
              { icon: "🧄", x: parallaxY1, y: parallaxX2, top: "80%", left: "10%", delay: 0.6, rotate: -30 },
              { icon: "🧅", x: parallaxX2, y: parallaxY1, top: "0%", left: "20%", delay: 0.8, rotate: 10 },
              { icon: "🌶", x: parallaxX1, y: parallaxX1, top: "40%", left: "95%", delay: 1.0, rotate: 60 }
            ].map((ing, idx) => (
              <motion.div 
                key={idx}
                style={{ x: ing.x, y: ing.y, top: ing.top, left: ing.left }} 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + ing.delay, type: "spring" }}
                className="absolute z-30 size-20 md:size-24 bg-white/5 backdrop-blur-md rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-center justify-center hover:scale-110 transition-transform cursor-default"
              >
                <motion.span 
                  animate={{ rotate: [ing.rotate, ing.rotate + 10, ing.rotate - 10, ing.rotate], y: [0, -10, 0] }}
                  transition={{ duration: 4 + idx, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl md:text-5xl drop-shadow-xl"
                >
                  {ing.icon}
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-12"
          >
            <button onClick={() => setIsVideoOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full">
              <X className="size-8" />
            </button>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-5xl aspect-video bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="size-20 text-white/20" />
                <span className="absolute mt-32 text-white/50 font-bold tracking-widest uppercase">Video Player Placeholder</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-12 space-y-16">
        
        {/* ======================================= */}
        {/* 2. AI FEATURE CARDS */}
        {/* ======================================= */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="size-6 text-emerald-500" />
            <h2 className="text-2xl font-bold text-[#2C2C2E] tracking-tight">AI Modifications</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { icon: Leaf, title: "Make Healthier", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
              { icon: Zap, title: "High Protein", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
              { icon: Utensils, title: "Vegan Version", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
              { icon: Droplet, title: "Low Calories", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
              { icon: Users, title: "Family Size", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" }
            ].map((feature, idx) => (
              <motion.button 
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[24px] border-2 transition-all shadow-sm hover:shadow-xl ${feature.bg} ${feature.border}`}
              >
                <div className={`size-12 rounded-full bg-white flex items-center justify-center shadow-sm ${feature.color}`}>
                  <feature.icon className="size-6" />
                </div>
                <span className={`font-bold text-sm text-center ${feature.color}`}>{feature.title}</span>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ======================================= */}
        {/* 3. ENHANCED INGREDIENTS */}
        {/* ======================================= */}
        <section>
          <div className="flex items-center justify-between mb-8">
             <div>
               <h2 className="text-3xl font-bold text-[#2C2C2E] tracking-tight">Smart Ingredients</h2>
               <p className="text-slate-500 font-medium mt-1">Live inventory mapping. Switch brands as needed.</p>
             </div>
             <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">{resolvedIngredients.length} Items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resolvedIngredients.map((ing: any) => {
              if (ing.status === 'out_of_stock') {
                return (
                  <motion.div key={ing.name} layout className="relative p-5 rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50 opacity-70 flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shrink-0 grayscale">{ing.icon}</div>
                      <div>
                        <h3 className="font-semibold text-slate-500 line-through">{ing.name}</h3>
                        <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Out of Stock</span>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              const product = ing.selectedProduct;
              const inCart = cartItems.some(i => i.product.id === product.id);
              const isSwapping = expandedSwap === ing.name;
              
              return (
                <motion.div 
                  key={ing.name} layout
                  className={`group relative p-5 rounded-[28px] border-2 transition-all flex flex-col gap-4 overflow-hidden ${inCart ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-white border-slate-200 shadow-md hover:shadow-xl hover:border-slate-300'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="size-20 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden relative">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <span className="text-4xl">{ing.icon}</span>
                      )}
                      {inCart && (
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 className="size-8 text-emerald-500 drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-bold text-[15px] leading-tight ${inCart ? 'text-emerald-900' : 'text-[#2C2C2E]'}`}>{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{ing.requiredQty} {ing.requiredUnit}</span>
                        <span className="text-lg font-bold text-emerald-600">{formatCurrency(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      {product.isOrganic && <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded"><ShieldCheck className="size-3" /> Organic</span>}
                      <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded"><Truck className="size-3" /> {product.deliveryTime || 'In Stock'}</span>
                    </div>
                    
                    {ing.matches.length > 1 && (
                      <div className="pt-2">
                        <button 
                          onClick={() => setExpandedSwap(isSwapping ? null : ing.name)}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-200"
                        >
                          {isSwapping ? <ChevronDown className="size-4 rotate-180 transition-transform" /> : <ChevronDown className="size-4 transition-transform" />}
                          Swap ({ing.matches.length - 1} alternatives)
                        </button>
                        
                        <AnimatePresence>
                          {isSwapping && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 flex flex-col gap-2"
                            >
                              {ing.matches.map((match: any) => (
                                <div 
                                  key={match.id}
                                  onClick={() => {
                                    setSelectedVariants(prev => ({ ...prev, [ing.name]: match.id }));
                                    setExpandedSwap(null);
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${match.id === product.id ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-slate-100 hover:border-slate-300'}`}
                                >
                                  <div className="flex items-center gap-2">
                                    <img src={match.images[0]} alt={match.name} className="size-8 object-contain rounded bg-white" />
                                    <span className={`text-xs font-bold truncate w-32 ${match.id === product.id ? 'text-emerald-800' : 'text-slate-700'}`}>{match.name}</span>
                                  </div>
                                  <span className="text-xs font-bold text-[#2C2C2E]">{formatCurrency(match.price)}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ONE CLICK ADD CTA */}
          {missingIngredients.length > 0 ? (
             <motion.div 
               initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
               className="mt-10 bg-slate-900 rounded-[36px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
             >
               <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
               <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
               
               <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
                 <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-emerald-400 text-sm font-bold mb-4 border border-white/10 backdrop-blur-sm">
                   <CheckCircle2 className="size-4" /> Cart Analysis Complete
                 </div>
                 <h3 className="text-white font-semibold text-3xl md:text-4xl tracking-tight leading-tight">Missing {missingIngredients.length} ingredients</h3>
                 <p className="text-slate-400 text-lg font-medium mt-2 max-w-md">We checked your cart. You need these to cook {recipe.name}.</p>
               </div>
               
               <button 
                 onClick={handleAddMissing}
                 className="relative z-10 w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-5 rounded-[24px] font-bold text-xl shadow-[0_20px_40px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
               >
                 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                 <Sparkles className="size-6" />
                 Add Missing • {formatCurrency(missingTotal)}
               </button>
             </motion.div>
          ) : (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="mt-10 bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-500/30 rounded-[36px] p-12 flex flex-col items-center justify-center text-center shadow-lg"
             >
               <div className="size-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)]">
                 <CheckCircle2 className="size-10 text-white" />
               </div>
               <h3 className="text-emerald-900 font-semibold text-3xl tracking-tight">You're ready to cook!</h3>
               <p className="text-emerald-700 font-bold mt-3 text-lg">All ingredients are currently safely in your cart.</p>
             </motion.div>
          )}
        </section>

        {/* ======================================= */}
        {/* 4. COOKING STEPS TIMELINE */}
        {/* ======================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold text-[#2C2C2E] tracking-tight mb-8">Cooking Timeline</h2>
            
            <div className="relative border-l-4 border-slate-200 ml-6 md:ml-8 space-y-12 pb-8">
              {recipe.steps.map((step: any, idx: number) => {
                const isExpanded = expandedStep === idx;
                return (
                  <div key={idx} className="relative pl-8 md:pl-12">
                    {/* Timeline Node */}
                    <div 
                      className={`absolute -left-[22px] top-0 size-10 rounded-full border-4 border-white flex items-center justify-center font-bold transition-colors ${isExpanded ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}
                      onClick={() => setExpandedStep(idx)}
                    >
                      {idx + 1}
                    </div>

                    <motion.div 
                      layout
                      onClick={() => setExpandedStep(idx)}
                      className={`rounded-[32px] border-2 transition-all cursor-pointer overflow-hidden ${isExpanded ? 'bg-white border-slate-900 shadow-2xl' : 'bg-white border-slate-100 shadow-md hover:shadow-xl hover:border-slate-300'}`}
                    >
                      <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isExpanded ? 'text-[#2C2C2E]' : 'text-slate-700'}`}>
                            {step.title}
                          </h3>
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                            <Clock className="size-4" /> {step.time}
                          </span>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                 {step.difficulty && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">{step.difficulty}</span>}
                                 <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${((idx + 1) / recipe.steps.length) * 100}%` }} transition={{ delay: 0.2, duration: 0.8 }} className="h-full bg-emerald-500 rounded-full" />
                                 </div>
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{Math.round(((idx + 1) / recipe.steps.length) * 100)}% Complete</span>
                              </div>

                              <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                                {step.desc}
                              </p>
                              
                              {step.img && (
                                <div className="w-full h-64 md:h-80 rounded-[24px] mb-6 overflow-hidden shadow-md">
                                  <ImageWithFallback src={step.img} alt={step.title} className="w-full h-full hover:scale-105 transition-transform duration-700" />
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {step.tip && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-[20px] p-5 flex gap-4 items-start md:col-span-2">
                                    <div className="size-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                                      <Star className="size-5 text-amber-600 fill-amber-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-amber-900 mb-1">Chef's Tip</h4>
                                      <p className="text-amber-800/80 font-medium text-sm leading-relaxed">{step.tip}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {step.proTip && (
                                  <div className="bg-blue-50 border border-blue-200 rounded-[20px] p-5 flex gap-4 items-start">
                                    <div className="size-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                      <Lightbulb className="size-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-blue-900 mb-1 text-sm">Pro Tip</h4>
                                      <p className="text-blue-800/80 font-medium text-xs leading-relaxed">{step.proTip}</p>
                                    </div>
                                  </div>
                                )}
                                
                                {step.mistake && (
                                  <div className="bg-rose-50 border border-rose-200 rounded-[20px] p-5 flex gap-4 items-start">
                                    <div className="size-8 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                                      <AlertTriangle className="size-4 text-rose-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-rose-900 mb-1 text-sm">Common Mistake</h4>
                                      <p className="text-rose-800/80 font-medium text-xs leading-relaxed">{step.mistake}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================= */}
          {/* 5. NUTRITION CARDS */}
          {/* ======================================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-2xl font-bold text-[#2C2C2E] tracking-tight mb-6">Nutrition Facts</h2>
              <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-xl p-6 md:p-8">
                <div className="flex justify-between items-end mb-8 border-b-2 border-slate-100 pb-6">
                  <div>
                    <span className="text-4xl font-bold text-[#2C2C2E] tracking-tight">{recipe.nutrition.calories}</span>
                    <span className="text-slate-500 font-bold ml-2">kcal</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">Per Serving</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Protein", val: `${recipe.nutrition.protein}g`, color: "bg-blue-500" },
                    { label: "Carbs", val: `${recipe.nutrition.carbs}g`, color: "bg-amber-500" },
                    { label: "Fat", val: `${recipe.nutrition.fat}g`, color: "bg-rose-500" },
                    { label: "Fiber", val: `${recipe.nutrition.fiber}g`, color: "bg-emerald-500" },
                  ].map((nut) => (
                    <div key={nut.label} className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`size-2.5 rounded-full ${nut.color}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{nut.label}</span>
                      </div>
                      <span className="text-xl font-bold text-[#2C2C2E]">{nut.val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-slate-900 rounded-[20px] p-5 flex items-start gap-4">
                   <Info className="size-6 text-emerald-400 shrink-0 mt-0.5" />
                   <p className="text-slate-300 text-xs font-medium leading-relaxed">
                     Nutrition information is automatically calculated by our AI engine and may vary slightly based on actual ingredient brands used.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* 6. RELATED RECIPES CAROUSEL */}
        {/* ======================================= */}
        <section className="pt-8 border-t-2 border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#2C2C2E] tracking-tight">People also cooked</h2>
          </div>

          <AutoCarousel
            paginationId="activePill-Recipes"
            viewportClassName="-mx-2 px-2 py-4"
            containerClassName="gap-6"
            options={{
              slidesToScroll: 1,
              breakpoints: {
                '(min-width: 768px)': { slidesToScroll: 2 },
                '(min-width: 1024px)': { slidesToScroll: 3 }
              }
            }}
          >
            {relatedRecipes.map((item) => (
              <div key={item.id} className="flex-[0_0_280px] shrink-0 min-w-0">
                <Link to="/recipe/$id" params={{ id: item.id.toString() }} className="w-full h-full bg-white rounded-[32px] border border-slate-100 shadow-md hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all overflow-hidden group block">
                  <div className="h-[200px] w-full overflow-hidden relative bg-slate-100">
                    <ImageWithFallback src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                      <Clock className="size-3 text-slate-700" />
                      <span className="text-xs font-bold text-[#2C2C2E]">{item.time}</span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between h-[160px]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <h3 className="font-semibold text-lg text-[#2C2C2E] truncate pr-2">{item.name}</h3>
                         <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md shrink-0"><Star className="size-3 fill-amber-500" /> {item.rating}</span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium line-clamp-2">{(item as any).description || (item as any).desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{item.difficulty}</span>
                      <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <ArrowRight className="size-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </AutoCarousel>
        </section>

      </div>
      </motion.div>
    </AnimatePresence>
  );
}

