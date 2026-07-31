import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigateBack } from '@/lib/hooks/use-navigate-back';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { Heart, ArrowLeft, Search, SlidersHorizontal, Share2, Grid, List, Filter, ShoppingBag, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-store';
import { DB } from '@/lib/enterprise-data';
import { ProductCard } from '@/components/product-card';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart-store';
import { useFlyToCart } from '@/components/fly-to-cart-provider';

export const Route = createFileRoute('/wishlist')({
  component: WishlistPage,
});

function WishlistPage() {
  const goBack = useNavigateBack();
  const { items, toggle } = useWishlist();
  const add = useCart(s => s.add);
  const triggerPulse = useCart(s => s.triggerPulse);
  const { triggerFlyToCart } = useFlyToCart();

  const [searchQuery, setSearchQuery] = usePersistedState('wishlist_search', '');
  const [viewMode, setViewMode] = usePersistedState<'grid' | 'list'>('wishlist_viewMode', 'grid');
  // Removed activeCollection state
  const [sortBy, setSortBy] = usePersistedState<'newest' | 'price-asc' | 'price-desc' | 'discount'>('wishlist_sortBy', 'newest');

  // Derive products from wishlist state
  const wishlistProducts = useMemo(() => {
    let filteredIds = items;

    let products = filteredIds
      .map(id => {
        const product = DB.products.findById(id);
        return product ? { ...product, _addedAt: 0 } : null;
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || DB.brands.findById(p.brandId)?.name.toLowerCase().includes(q));
    }

    // Sort
    products.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'discount': {
          const aDiscount = a.compareAt ? ((a.compareAt - a.price) / a.compareAt) * 100 : 0;
          const bDiscount = b.compareAt ? ((b.compareAt - b.price) / b.compareAt) * 100 : 0;
          return bDiscount - aDiscount;
        }
        case 'newest':
        default:
          return b._addedAt - a._addedAt;
      }
    });

    return products;
  }, [items, searchQuery, sortBy]);

  const totalEstimatedValue = useMemo(() => {
    return wishlistProducts.reduce((acc, p) => acc + p.price, 0);
  }, [wishlistProducts]);

  const handleShare = async () => {
    const shareData = {
      title: 'My Himanshu Store Wishlist',
      text: `Check out my ${wishlistProducts.length} favorite items on Himanshu Store!`,
      url: window.location.href,
    };
    
    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Wishlist link copied to clipboard!');
    }
  };

  const handleMoveToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    triggerFlyToCart(e, product, () => {
      add(product);
      toggle(product.id);
      triggerPulse();
      toast.success('Moved to cart!');
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Premium Header Region */}
      <div className="bg-white border-b border-slate-200/60 sticky top-[64px] z-40 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <button onClick={() => goBack("/")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="size-4" /> Back to Shopping
              </button>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2E] flex items-center gap-4">
                Your Wishlist
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="bg-rose-100 text-rose-500 rounded-full p-2.5 shadow-sm border border-rose-200/50"
                >
                  <Heart className="size-7 fill-rose-500" />
                </motion.div>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Total</div>
                <div className="text-2xl font-bold text-[#2C2C2E]">{formatCurrency(totalEstimatedValue)}</div>
              </div>
              <div className="h-10 w-px bg-slate-200 mx-2 hidden sm:block" />
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95 border border-slate-200"
              >
                <Share2 className="size-4" /> Share
              </button>
            </div>
          </div>

          {/* Collections Tabs Removed for Simplicity */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 pt-2">
            <button
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all border bg-slate-900 text-white border-slate-900 shadow-md`}
            >
              All Items ({items.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Toolbar */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-8 font-bold text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
              >
                <option value="newest">Recently Added</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Biggest Discount</option>
              </select>
              
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 shadow-sm hover:bg-slate-50 transition-colors shrink-0">
                <Filter className="size-4" /> Filters
              </button>

              <div className="flex items-center bg-slate-200/50 rounded-xl p-1 shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2C2C2E]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Grid className="size-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2C2C2E]' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid / List */}
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[500px] text-center bg-white rounded-[40px] border border-slate-100 shadow-sm p-8"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-rose-100 rounded-full blur-2xl opacity-50" />
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-8 rounded-full border border-rose-200 relative z-10 shadow-inner">
                <Heart className="size-20 text-rose-400 fill-white" strokeWidth={1.5} />
              </div>
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-white p-3 rounded-full shadow-lg border border-slate-100 z-20"
              >
                <Sparkles className="size-6 text-amber-400" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-[#2C2C2E] mb-3 tracking-tight">Your Wishlist is Empty</h2>
            <p className="text-slate-500 font-medium max-w-md mb-8 text-lg">
              Explore our fresh catalog and click the heart icon to save products you love for later.
            </p>
            <button onClick={() => goBack("/")} className="mt-8 bg-emerald-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 mx-auto">
              Explore Products <ArrowLeft className="size-5 rotate-180" />
            </button>
          </motion.div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2C2C2E] mb-2">No matching products</h3>
            <p className="text-slate-500">Try adjusting your search or switching collections.</p>
          </div>
        ) : (
          <motion.div layout className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            <AnimatePresence mode="popLayout">
              {wishlistProducts.map((product) => (
                <motion.div
                  layout
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`group relative ${viewMode === 'list' ? 'flex items-center gap-4 bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm' : ''}`}
                >
                  <div className={viewMode === 'list' ? 'w-32 shrink-0 pointer-events-none' : 'w-full'}>
                    <ProductCard product={product} />
                  </div>
                  
                  {/* Action Overlay / Button */}
                  <div className={viewMode === 'list' ? 'flex-1 pr-2' : 'absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-300 z-30'}>
                    <button 
                      onClick={(e) => handleMoveToCart(e, product)}
                      className={`w-full flex items-center justify-center gap-2 font-bold transition-all active:scale-95 ${viewMode === 'list' ? 'bg-slate-100 text-[#2C2C2E] py-3 rounded-xl hover:bg-slate-200' : 'bg-slate-900/95 backdrop-blur-md text-white py-3 rounded-xl shadow-xl hover:bg-black border border-white/10'}`}
                    >
                      <ShoppingBag className="size-4" /> 
                      {viewMode === 'list' ? 'Move to Cart' : 'Move to Cart'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

