import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductService, ProductFilters } from "@/lib/services/product-service";
import type { Product } from "@/lib/enterprise-data";
import { Search, Filter, ChevronDown, SlidersHorizontal, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { DB } from "@/lib/enterprise-data";

type ProductSearch = {
  category?: string;
  sort?: string;
};

export const Route = createFileRoute("/products")({
  validateSearch: (search: Record<string, unknown>): ProductSearch => {
    return {
      category: (search.category as string) || "All",
      sort: (search.sort as string) || "Popular",
    };
  },
  head: () => ({
    meta: [
      { title: "Shop fresh groceries — Himanshu Store" },
      { name: "description", content: "Browse organic produce, bakery, dairy, and pantry — delivered in under 15 minutes." },
    ],
  }),
  component: ProductsPage,
});

const SORTS = ["Popular", "Price ↑", "Price ↓", "Rating", "Discount"] as const;

function ProductsPage() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [category, setCategory] = useState(search.category || "All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>((search.sort as any) || "Popular");
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Fetch logic
  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const filters: ProductFilters = {
        query: debouncedSearch,
        categoryIds: category === "All" ? [] : [category],
        sort: sort,
        page: isLoadMore ? page + 1 : 1,
        limit: 12
      };

      const result = await ProductService.searchProducts(filters);

      if (isLoadMore) {
        setItems(prev => [...prev, ...result.items]);
        setPage(result.page);
      } else {
        setItems(result.items);
        setPage(1);
      }
      setHasMore(result.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, category, sort, page]);

  // Initial Fetch & Filter changes
  useEffect(() => {
    fetchProducts(false);
    // Sync URL
    navigate({ search: { category, sort }, replace: true });
  }, [debouncedSearch, category, sort]);

  // Infinite Scroll Observer
  const observerTarget = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchProducts(true);
        }
      },
      { threshold: 1.0 }
    );
    
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchProducts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 min-h-screen bg-slate-50/50">
      
      {/* Top Header & Search */}
      <header id="catalog" className="mb-8 p-4 -m-4 bg-white/80 backdrop-blur-xl sticky top-[72px] z-40 border-b border-slate-100/50 rounded-b-3xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-[#1C1C1E]">
              Shop everything
            </h1>
            <p className="mt-1 text-emerald-600 font-semibold text-sm">
              Delivered in under 15 minutes
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="size-4 text-slate-400" />
                </button>
              )}
            </div>

            {/* Mobile Filters Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden size-11 flex items-center justify-center bg-slate-100/80 rounded-2xl shrink-0 text-slate-700"
            >
              <SlidersHorizontal className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col gap-8 shrink-0 sticky top-[200px] h-fit">
          {/* Categories */}
          <div>
            <h3 className="font-bold text-[#1C1C1E] mb-4 flex items-center gap-2">
              <Filter className="size-4 text-emerald-500" /> Categories
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                <input 
                  type="radio" name="cat" checked={category === "All"} onChange={() => setCategory("All")}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span className="text-sm font-semibold text-slate-700">All Products</span>
              </label>
              {DB.categories.findMany().map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                  <input 
                    type="radio" name="cat" checked={category === c.id} onChange={() => setCategory(c.id)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">{c.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Sort */}
          <div>
            <h3 className="font-bold text-[#1C1C1E] mb-4">Sort By</h3>
            <div className="flex flex-col gap-1.5">
              {SORTS.map(s => (
                <label key={s} className="flex items-center gap-3 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors">
                  <input 
                    type="radio" name="sort" checked={sort === s} onChange={() => setSort(s)}
                    className="w-4 h-4 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="text-sm font-semibold text-slate-700">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-500">
              <Loader2 className="size-8 animate-spin" />
              <p className="mt-4 text-sm font-bold text-slate-500">Loading catalog...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
              <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1C1C1E]">No products found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
              <button 
                onClick={() => { setSearchQuery(""); setCategory("All"); setSort("Popular"); }}
                className="mt-6 px-6 py-2 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {items.map(p => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={p.id}
                    >
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
              
              {/* Infinite Scroll Trigger */}
              <div ref={observerTarget} className="h-20 w-full flex items-center justify-center mt-8">
                {loadingMore && <Loader2 className="size-6 text-emerald-500 animate-spin" />}
                {!hasMore && items.length > 0 && (
                  <p className="text-sm font-bold text-slate-400">You've reached the end!</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-[100] md:hidden font-sans">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl h-[80vh] flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="size-4" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-[#1C1C1E] mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setCategory("All")}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${category === "All" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"}`}
                    >
                      All
                    </button>
                    {DB.categories.findMany().map(c => (
                      <button
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${category === c.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort */}
                <div>
                  <h3 className="font-bold text-[#1C1C1E] mb-3">Sort By</h3>
                  <div className="flex flex-wrap gap-2">
                    {SORTS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSort(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${sort === s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white">
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
