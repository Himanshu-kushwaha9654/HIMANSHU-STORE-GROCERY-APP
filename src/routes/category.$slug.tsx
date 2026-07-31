import { createFileRoute, Link } from "@tanstack/react-router";
import { DB, MOCK_CATEGORIES } from "@/lib/enterprise-data";
import { ProductCard } from "@/components/product-card";
import { Search, ChevronDown, Filter, LayoutGrid, Leaf, Sparkles, Clock, Percent, Star, ArrowUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = DB.categories.findBySlug(slug) || MOCK_CATEGORIES[0];
  const dbSubcategories = DB.subcategories.findMany(category.id);
  
  const [activeSub, setActiveSub] = useState("all");
  const [isOrganic, setIsOrganic] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [hasOffers, setHasOffers] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('relevance');
  const [inputValue, setInputValue] = useState("");
  
  const products = DB.products.findMany({ 
    categoryId: category.id, 
    subcategoryId: activeSub !== "all" ? activeSub : undefined,
    search: inputValue,
    isOrganic,
    fastDelivery,
    hasOffers,
    sortBy,
    limit: 12 
  });
  
  const [isFocused, setIsFocused] = useState(false);

  const categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Slide-up placeholder effect state
  const SUGGESTIONS = [categoryName, "fresh products", "best sellers", "top rated", "offers", "new arrivals"];
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    if (isFocused || inputValue) return;
    const interval = setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isFocused, inputValue]);

  return (
    <div className="min-h-screen bg-[#f4f6fb] pt-[80px] pb-24">
      {/* Top Banner (Optional for Categories) */}
      <div className="bg-white border-b border-black/5 px-4 md:px-8 py-4 mb-6">
         <div className="max-w-[1400px] mx-auto flex items-center gap-2 text-sm">
            <span className="text-slate-500">Home</span>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-[#2C2C2E]">{categoryName}</span>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex items-start gap-6">
        {/* Left Sidebar - Sticky */}
        <div className="hidden md:block w-[260px] shrink-0 sticky top-[100px] bg-white rounded-2xl shadow-sm border border-black/5 p-4 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2C2E] tracking-tight mb-2 drop-shadow-sm capitalize">
              {category.name}
            </h1>
            <p className="text-slate-600 font-medium text-sm max-w-sm mb-6">
              Fresh {category.name.toLowerCase()} delivered to your doorstep in minutes.
            </p>
          
          <div className="flex flex-col gap-1">
            {[{id: "all", name: "All Products"}, ...dbSubcategories].map((sub: any) => {
               const isActive = activeSub === sub.id;
               const Icon = sub.icon || LayoutGrid;
               return (
                 <button 
                   key={sub.id} 
                   onClick={() => setActiveSub(sub.id)}
                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group ${isActive ? 'bg-[#ebf0f9] text-primary' : 'hover:bg-slate-50 text-slate-700'}`}
                 >
                   <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center border border-black/5">
                     {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                     ) : Icon ? (
                        <Icon className={`size-5 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-primary'}`} />
                     ) : null}
                   </div>
                   
                   <div className="flex flex-col flex-1 min-w-0">
                     <span className={`text-[13px] font-bold truncate ${isActive ? 'text-primary' : 'text-slate-700'}`}>
                        {sub.name}
                     </span>
                     <span className="text-[11px] font-medium text-slate-400">
                        {sub.count} products
                     </span>
                   </div>
                   
                   {sub.badge && (
                     <span className="bg-rose-100 text-rose-600 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm">
                       {sub.badge}
                     </span>
                   )}
                 </button>
               );
            })}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-3">
              Explore More Categories
            </h3>
            <div className="flex flex-col gap-1">
              {DB.categories.findMany().filter(c => c.id !== category.id).map((cat) => (
                <Link
                  key={cat.id}
                  to="/category/$slug"
                  params={{ slug: cat.slug }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-[#2C2C2E] group"
                >
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-black/5">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-[13px] font-bold truncate">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Sticky Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-3 mb-6 sticky top-[80px] md:top-[100px] z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-xl bg-white/90">
             
             {/* Left side Toolbar */}
             <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                <div className="relative flex items-center">
                   <ArrowUpDown className="absolute left-3 size-3.5 text-slate-500 pointer-events-none" />
                   <select 
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value as any)}
                     className="appearance-none pl-8 pr-8 py-1.5 bg-slate-100 rounded-lg text-[13px] font-bold text-slate-700 hover:bg-slate-200 transition-colors outline-none cursor-pointer"
                   >
                     <option value="relevance">Relevance</option>
                     <option value="price_asc">Price: Low to High</option>
                     <option value="price_desc">Price: High to Low</option>
                     <option value="discount">Discount</option>
                     <option value="rating">Top Rated</option>
                   </select>
                   <ChevronDown className="absolute right-3 size-3.5 text-slate-500 pointer-events-none" />
                </div>
                <div className="w-[1px] h-6 bg-slate-200 mx-1 shrink-0"></div>
                {/* Quick Filters */}
                <button 
                   onClick={() => setIsOrganic(!isOrganic)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap ${isOrganic ? 'bg-green-50 border-green-200 text-green-700' : 'border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary'}`}>
                   <Leaf className="size-3.5 text-green-600" /> Organic
                </button>
                <button 
                   onClick={() => setFastDelivery(!fastDelivery)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap ${fastDelivery ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary'}`}>
                   <Clock className="size-3.5 text-blue-500" /> Fast Delivery
                </button>
                <button 
                   onClick={() => setHasOffers(!hasOffers)}
                   className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[12px] font-bold transition-colors whitespace-nowrap ${hasOffers ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-primary/50 hover:text-primary'}`}>
                   <Percent className="size-3.5 text-rose-500" /> Offers
                </button>
             </div>

             {/* Search */}
             <div className="relative w-full md:w-[240px] shrink-0 flex items-center group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 z-10 pointer-events-none group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="relative z-20 w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all focus:bg-white bg-transparent"
                />

                {/* Slide-up placeholder */}
                {!isFocused && !inputValue && (
                  <div className="absolute left-9 top-0 bottom-0 right-4 flex items-center overflow-hidden pointer-events-none z-10 text-slate-400 text-sm font-medium">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={suggestionIndex}
                        initial={{ y: 25, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -25, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        Search in {SUGGESTIONS[suggestionIndex]}...
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
             </div>
          </div>

          {/* Product Grid */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
              hidden: {}
            }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
          >
            {products.map((product) => (
              <motion.div 
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          {/* Virtual Pagination / Load More (Visual only for now) */}
          <div className="mt-12 flex justify-center">
             <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                Load More Products
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}

