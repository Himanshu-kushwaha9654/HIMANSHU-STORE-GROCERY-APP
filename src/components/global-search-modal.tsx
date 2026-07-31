import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Mic, X, Clock, TrendingUp, Sparkles, Tag, 
  ChevronRight, ScanLine, Loader2, Leaf, Zap, Percent, Star, AlertCircle, History
} from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSearchStore } from "@/lib/search-store";
import { useFlyToCart } from "./fly-to-cart-provider";
import { useCart } from "@/lib/cart-store";
import { formatCurrency } from "@/lib/currency";
import { SearchService, SearchResult, SearchFilters } from "@/lib/search-service";
import { useDebounce } from "@/hooks/use-debounce";
import { DB } from "@/lib/enterprise-data";

const Highlight = ({ text, query }: { text: string, query: string }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <mark key={i} className="bg-emerald-100 text-emerald-900 rounded-[2px] px-[1px] font-bold">{part}</mark>
          : part
      )}
    </>
  );
};

export function GlobalSearchModal() {
  const { 
    isOpen, setIsOpen, 
    recentSearches, removeRecentSearch, addRecentSearch, clearRecentSearches,
    recentlyViewed, addRecentlyViewed 
  } = useSearchStore();
  
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [results, setResults] = useState<SearchResult | null>(null);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const add = useCart(s => s.add);
  const { triggerFlyToCart } = useFlyToCart();

  // Keyboard Navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(prev => {
            const max = results ? results.products.length - 1 : (popularSearches.length + recentSearches.length - 1);
            return prev < max ? prev + 1 : prev;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(prev => prev > -1 ? prev - 1 : -1);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
          e.preventDefault();
          if (results && results.products[activeIndex]) {
            handleProductClick(results.products[activeIndex]);
          } else if (!results) {
            // Empty state navigation
            if (activeIndex < recentSearches.length) {
              executeSearch(recentSearches[activeIndex]);
            } else {
              executeSearch(popularSearches[activeIndex - recentSearches.length]);
            }
          }
        }
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, setIsOpen, activeIndex, results, recentSearches]);

  // Modal Lifecycle
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery("");
      setIsListening(false);
      setVoiceError("");
      setIsScanning(false);
      setActiveFilters({});
      setResults(null);
      setActiveIndex(-1);
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  // Async Search Effect
  useEffect(() => {
    const fetchResults = async () => {
      setActiveIndex(-1);
      if (!debouncedQuery.trim() && Object.keys(activeFilters).length === 0) {
        setResults(null);
        return;
      }
      setIsLoading(true);
      try {
        const res = await SearchService.search(debouncedQuery, activeFilters);
        setResults(res);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery, activeFilters]);

  // Voice Search (Browser SpeechRecognition API)
  const handleVoiceSearch = () => {
    if (isListening) return;
    setVoiceError("");
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Voice search is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; 
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'network') {
          setVoiceError("Network error. Please check your connection.");
        } else if (event.error === 'not-allowed') {
          setVoiceError("Microphone access denied.");
        } else {
          setVoiceError("Could not recognize voice. Please try again.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setVoiceError("Failed to start voice search. Please try typing instead.");
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      executeSearch("Amul Butter"); // Mock scanner result
    }, 2000);
  };

  const handleProductClick = (product: any) => {
    addRecentSearch(product.name);
    addRecentlyViewed(product.id);
    setIsOpen(false);
    navigate({ to: '/products/$id', params: { id: product.id } });
  };

  const handleCategoryClick = (category: any) => {
    addRecentSearch(category.name);
    setIsOpen(false);
    navigate({ to: '/category/$slug', params: { slug: category.slug } });
  };

  const executeSearch = (q: string) => {
    setQuery(q);
    addRecentSearch(q);
    inputRef.current?.focus();
  };

  const popularSearches = SearchService.getPopularSearches();
  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewed.map(id => DB.products.findById(id)).filter(Boolean).slice(0, 4);
  }, [recentlyViewed]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 sm:pt-16 px-4">
          
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsOpen(false)}
          />

          {/* Search Panel Modal */}
          <motion.div
            layoutId="search-bar-container"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-5xl bg-[#f8fafc] rounded-[32px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-white/50 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Massive Search Input Header */}
            <div className="relative shrink-0 border-b border-black/5 bg-white p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Search className={`size-8 shrink-0 transition-colors ${isLoading ? 'text-emerald-300 animate-pulse' : 'text-emerald-500'}`} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && query.trim() && activeIndex === -1) {
                      addRecentSearch(query);
                    }
                  }}
                  placeholder='Try "Organic fruits", "Milk under ₹50", or "High protein snacks"...'
                  className="flex-1 bg-transparent border-none outline-none text-xl sm:text-2xl font-bold text-[#2C2C2E] placeholder:text-slate-300 placeholder:font-medium"
                />
                
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleScan}
                    className="flex items-center justify-center size-12 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-100"
                    title="Scan Barcode"
                  >
                    {isScanning ? <Loader2 className="size-5 animate-spin text-emerald-500" /> : <ScanLine className="size-5" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVoiceSearch}
                    title="Voice Search"
                    className={`relative flex items-center justify-center size-12 rounded-full transition-colors border ${
                      isListening 
                        ? "bg-rose-50 border-rose-200 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]" 
                        : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    <Mic className={`size-5 ${isListening ? 'animate-pulse text-rose-500' : ''}`} />
                    {isListening && (
                      <span className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-30" />
                    )}
                  </motion.button>
                  
                  <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block" />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="hidden sm:flex items-center justify-center size-12 rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-colors"
                  >
                    <X className="size-5" />
                  </motion.button>
                </div>
              </div>

              {/* Voice Error Fallback */}
              <AnimatePresence>
                {voiceError && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    <AlertCircle className="size-4" />
                    {voiceError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Smart Filters Row */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <FilterChip 
                  active={!!activeFilters.isOrganic} 
                  onClick={() => setActiveFilters(s => ({ ...s, isOrganic: !s.isOrganic }))}
                  icon={<Leaf className="size-3.5 text-green-500" />}
                  label="Organic"
                />
                <FilterChip 
                  active={!!activeFilters.fastDelivery} 
                  onClick={() => setActiveFilters(s => ({ ...s, fastDelivery: !s.fastDelivery }))}
                  icon={<Zap className="size-3.5 text-amber-500" />}
                  label="10 Min Delivery"
                />
                <FilterChip 
                  active={!!activeFilters.hasOffers} 
                  onClick={() => setActiveFilters(s => ({ ...s, hasOffers: !s.hasOffers }))}
                  icon={<Percent className="size-3.5 text-rose-500" />}
                  label="Offers"
                />
                <FilterChip 
                  active={activeFilters.sortBy === 'rating'} 
                  onClick={() => setActiveFilters(s => ({ ...s, sortBy: s.sortBy === 'rating' ? undefined : 'rating' }))}
                  icon={<Star className="size-3.5 text-amber-400" />}
                  label="Top Rated"
                />
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-6 relative">
              
              {/* Loader Overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center"
                  >
                    <Loader2 className="size-8 text-emerald-500 animate-spin" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Logic */}
              <AnimatePresence mode="wait">
                {!results ? (
                  // EMPTY STATE (No query)
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left: Recent Searches */}
                      <div className="space-y-6">
                        {recentSearches.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                <Clock className="size-4" /> Recent Searches
                              </h3>
                              <button onClick={clearRecentSearches} className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors">Clear All</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {recentSearches.map((s, i) => (
                                <div key={i} className={`group flex items-center rounded-xl bg-white border shadow-sm transition-all hover:border-emerald-200 hover:shadow-md ${activeIndex === i ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                                  <button
                                    onClick={() => executeSearch(s)}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 group-hover:text-emerald-700"
                                  >
                                    <Search className="size-3.5 text-slate-400 group-hover:text-emerald-500" />
                                    {s}
                                  </button>
                                  <button 
                                    onClick={() => removeRecentSearch(s)}
                                    className="pr-3 pl-1 py-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Trending */}
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <TrendingUp className="size-4 text-rose-500" /> Trending Now
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {popularSearches.map((s, i) => {
                              const absIndex = recentSearches.length + i;
                              return (
                                <motion.button
                                  key={i}
                                  whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px -10px rgba(16,185,129,0.3)" }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => executeSearch(s)}
                                  className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${activeIndex === absIndex ? 'bg-emerald-500 text-white shadow-lg' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}
                                >
                                  {s}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Right: Recently Viewed */}
                      {recentlyViewedProducts.length > 0 && (
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                            <History className="size-4 text-indigo-500" /> Recently Viewed
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {recentlyViewedProducts.map((p, i) => (
                              <div 
                                key={p.id}
                                onClick={() => handleProductClick(p)}
                                className="group flex flex-col gap-2 p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
                              >
                                <div className="aspect-square rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2">
                                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                </div>
                                <div>
                                  <h4 className="text-[11px] font-bold text-[#2C2C2E] line-clamp-2 leading-snug">{p.name}</h4>
                                  <div className="text-[10px] font-bold text-slate-400 mt-1">{formatCurrency(p.price)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : results.products.length > 0 || results.categories.length > 0 || results.brands.length > 0 ? (
                  // RESULTS STATE
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col md:flex-row gap-8"
                  >
                    {/* Left Column: Suggestions, Categories, Brands */}
                    <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-8">
                      
                      {/* AI Suggestions / Parsed Intent */}
                      {results.parsedQuery !== debouncedQuery.toLowerCase().trim() && Object.keys(results.appliedFilters).length > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                          <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Sparkles className="size-3.5" /> AI Search Active
                          </h3>
                          <p className="text-sm font-medium text-emerald-800">
                            Searching for <span className="font-bold">"{results.parsedQuery}"</span> with filters applied.
                          </p>
                        </div>
                      )}

                      {/* Suggestions */}
                      {results.suggestions.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Suggestions</h3>
                          <div className="flex flex-col gap-1">
                            {results.suggestions.map((sugg, i) => (
                              <button key={i} onClick={() => executeSearch(sugg)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-600 hover:text-emerald-600 hover:shadow-sm transition-all font-semibold text-sm group">
                                <Search className="size-4 opacity-50 group-hover:opacity-100 text-emerald-500" />
                                <span className="flex-1 text-left capitalize"><Highlight text={sugg} query={results.parsedQuery} /></span>
                                <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Categories */}
                      {results.categories.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Categories</h3>
                          <div className="flex flex-col gap-2">
                            {results.categories.map((cat, i) => (
                              <button key={i} onClick={() => handleCategoryClick(cat)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm transition-all group">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-black/5">
                                  <img src={cat.image} alt={cat.name} className="w-8 h-8 object-contain group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="font-bold text-sm text-[#2C2C2E] capitalize"><Highlight text={cat.name} query={results.parsedQuery} /></span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Brands */}
                      {results.brands.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Brands</h3>
                          <div className="flex flex-wrap gap-2">
                            {results.brands.map((brand, i) => (
                              <button key={i} onClick={() => executeSearch(brand.name)} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors shadow-sm capitalize">
                                <Highlight text={brand.name} query={results.parsedQuery} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Visual Products Grid */}
                    <div className="flex-1 min-w-0 bg-white rounded-[24px] p-4 sm:p-6 shadow-sm border border-slate-200/60">
                      <div className="flex items-center justify-between mb-6 px-1 border-b border-slate-100 pb-4">
                        <h3 className="text-base font-bold text-[#2C2C2E]">
                          Products <span className="text-slate-400 font-medium ml-1">({results.products.length})</span>
                        </h3>
                        <Link to="/products" search={{ search: query }} onClick={() => setIsOpen(false)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                          View All Results
                        </Link>
                      </div>
                      
                      {results.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.products.map((product, i) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.03 }}
                            >
                              <div 
                                onClick={() => handleProductClick(product)}
                                className={`group flex gap-3 p-3 rounded-2xl bg-white border hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition-all cursor-pointer h-full relative overflow-hidden ${activeIndex === i ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-100 hover:border-emerald-200'}`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="w-20 h-20 shrink-0 rounded-xl bg-[#f8fafc] p-2 overflow-hidden border border-slate-100 flex items-center justify-center relative z-10">
                                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300" />
                                  {product.discount > 0 && (
                                    <span className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg">-{product.discount}%</span>
                                  )}
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0 py-0.5 z-10">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{product.brand || "Premium"}</span>
                                  <h4 className="text-sm font-bold text-[#2C2C2E] line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                                    <Highlight text={product.name} query={results.parsedQuery} />
                                  </h4>
                                  <div className="mt-auto pt-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-slate-400">{product.weight}</span>
                                      <span className="font-bold text-[#2C2C2E]">{formatCurrency(product.price)}</span>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        triggerFlyToCart(e, product, () => add(product));
                                      }}
                                      className="size-8 rounded-full bg-slate-100 hover:bg-emerald-500 text-slate-600 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                                    >
                                      <span className="text-lg leading-none mb-0.5">+</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <Tag className="size-12 text-slate-200 mb-4" />
                          <h3 className="text-lg font-bold text-slate-700">No products match these filters.</h3>
                          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters or search query.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  // NO RESULTS STATE
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto"
                  >
                    <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-6 ring-8 ring-rose-50/50">
                      <Search className="size-10 text-rose-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#2C2C2E] mb-3">No results found for "{query}"</h2>
                    <p className="text-slate-500 mb-8 font-medium">We couldn't find anything matching your search. Check the spelling or try searching for something else.</p>
                    
                    <div className="w-full text-left">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Sparkles className="size-4" /> Try searching for
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {popularSearches.slice(0, 4).map((s, i) => (
                          <button key={i} onClick={() => executeSearch(s)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:border-emerald-300 hover:text-emerald-600 transition-colors shadow-sm">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
            
            {/* Footer */}
            <div className="shrink-0 border-t border-slate-100 bg-white p-3 sm:px-6 flex items-center justify-between text-xs font-medium text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><kbd className="font-sans font-bold bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-[10px] text-slate-600">↑↓</kbd> to navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="font-sans font-bold bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-[10px] text-slate-600">Enter</kbd> to select/search</span>
              </div>
              <span className="flex items-center gap-1.5"><kbd className="font-sans font-bold bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 shadow-sm text-[10px] text-slate-600">Esc</kbd> to close</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function FilterChip({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
        active 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
