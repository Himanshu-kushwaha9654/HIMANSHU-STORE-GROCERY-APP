import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, Star, ShieldCheck, Leaf, Info, ShoppingBag, Truck, Flame, Zap, Package, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { DB } from "@/lib/enterprise-data";
import { useCart } from "@/lib/cart-store";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useFlyToCart } from "@/components/fly-to-cart-provider";
import { useRecentlyViewed } from "@/lib/recently-viewed-store";
import { RecommendationCarousel } from "@/components/recommendation-carousel";
import { formatCurrency } from "@/lib/currency";
import { ProductService } from "@/lib/services/product-service";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { AIAssistant } from "@/components/product/ai-assistant";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const product = await ProductService.getProductById(params.id);
    if (!product) throw notFound();
    const relatedData = await ProductService.getRelatedProducts(product);
    return { product, relatedData };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found — Himanshu Store" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Himanshu Store` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — Himanshu Store` },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <Link to="/products" className="mt-4 inline-block text-emerald-600">
        Back to shop
      </Link>
    </div>
  ),
});

function ProductDetail() {
  const { product, relatedData } = Route.useLoaderData();
  const goBack = useNavigateBack();
  const add = useCart((s) => s.add);
  const triggerPulse = useCart((s) => s.triggerPulse);
  const { triggerFlyToCart } = useFlyToCart();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const addViewed = useRecentlyViewed((s) => s.addViewed);

  // Track recently viewed
  useEffect(() => {
    addViewed(product.id);
  }, [product.id, addViewed]);

  const { frequentlyBought, customersAlsoBought, healthyAlternatives, similarProducts } = relatedData;
  
  // We want to show recently viewed excluding the current product
  const recentlyViewedIds = useRecentlyViewed((s) => s.items).filter(id => id !== product.id);
  const recentlyViewedProducts = recentlyViewedIds
    .map(id => DB.products.findById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  // Parallax & Scroll effects
  const { scrollY } = useScroll();
  const buyBarOpacity = useTransform(scrollY, [0, 400, 500], [0, 0, 1]);
  const buyBarY = useTransform(scrollY, [0, 400, 500], [100, 100, 0]);

  const savings = product.compareAt ? product.compareAt - product.price : 0;
  const discountPercent = product.compareAt ? Math.round((savings / product.compareAt) * 100) : 0;

  return (
    <>
      <motion.div 
        layoutId={`product-card-${product.id}`}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl px-0 sm:px-6 py-4 lg:py-8 bg-white min-h-screen relative pb-32 lg:pb-0"
      >
        <button
          onClick={() => goBack("/products")}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors z-50 relative mb-4 lg:mb-8 px-4 sm:px-0"
        >
          <ArrowLeft className="size-4" /> Back to shop
        </button>

        <div className="grid gap-6 lg:gap-12 lg:grid-cols-[1.2fr_1fr] relative z-10 px-4 sm:px-0">
          
          {/* Left Side: Product Gallery */}
          <div className="sticky top-24 self-start">
            <ProductGallery product={product} />
          </div>

          {/* Right Side: Details & Actions */}
          <div className="flex flex-col">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Package className="size-3" /> Fresh Today
              </span>
              {product.rating > 4.5 && (
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Flame className="size-3" /> Best Seller
                </span>
              )}
              {product.isOrganic && (
                <span className="text-xs font-bold uppercase tracking-widest text-green-700 bg-green-100 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Leaf className="size-3" /> Organic
                </span>
              )}
              {product.stockQty < 10 && (
                <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <Zap className="size-3" /> Limited Stock
                </span>
              )}
            </div>
            
            <motion.h1 
              layoutId={`product-title-${product.id}`}
              className="text-3xl sm:text-4xl font-bold tracking-tight lg:text-5xl text-[#2C2C2E] leading-[1.1]"
            >
              {product.name}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-6 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-6"
            >
              <div className="flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                <Star className="size-4" fill="currentColor" />
                {product.rating.toFixed(1)}
              </div>
              <button onClick={() => setActiveTab('reviews')} className="text-sm font-bold text-slate-400 underline decoration-slate-200 underline-offset-4 hover:text-slate-600 transition-colors">
                {product.reviews} verified reviews
              </button>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-sm font-medium text-slate-500">
                Brand: <strong className="text-[#2C2C2E]">In-house</strong>
              </span>
            </motion.div>

            {/* Price Block */}
            <div className="mt-8 flex flex-col gap-2">
              <div className="flex items-end gap-4">
                <motion.span 
                  layoutId={`product-price-${product.id}`}
                  className="text-4xl lg:text-6xl font-bold text-[#2C2C2E] tracking-tighter"
                >
                  {formatCurrency(product.price)}
                </motion.span>
                <div className="flex flex-col justify-end pb-1.5">
                  <span className="text-lg font-bold text-slate-500">/ {product.weight} {product.unit}</span>
                  {product.compareAt && (
                    <span className="text-lg font-bold text-slate-400 line-through">
                      MRP: {formatCurrency(product.compareAt)}
                    </span>
                  )}
                </div>
              </div>
              
              {product.compareAt && savings > 0 && (
                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg inline-flex w-fit items-center gap-2 mt-2">
                  <Zap className="size-4" /> You save {formatCurrency(savings)} ({discountPercent}% OFF)
                </div>
              )}
              
              <div className="text-sm font-medium text-slate-500 mt-2">Inclusive of all taxes</div>
            </div>

            {/* Action Area */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 lg:mt-8 p-4 lg:p-6 bg-slate-50 rounded-[24px] lg:rounded-[32px] border border-slate-100 flex flex-col gap-4 lg:gap-6 shadow-inner hidden lg:flex"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm border border-slate-100 w-full sm:w-[160px] h-16">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid size-12 place-items-center rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-emerald-600 transition-colors active:scale-95 text-slate-700"
                  >
                    <Minus className="size-5" />
                  </button>
                  <span className="w-12 text-center text-2xl font-bold text-[#2C2C2E]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stockQty, q + 1))}
                    className="grid size-12 place-items-center rounded-xl bg-slate-50 hover:bg-slate-100 hover:text-emerald-600 transition-colors active:scale-95 text-slate-700"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
                
                <button
                  onClick={(e) => {
                    triggerFlyToCart(e, product, () => triggerPulse());
                    add(product, qty);
                  }}
                  className="flex-1 w-full h-16 rounded-2xl bg-emerald-500 font-bold text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] transition-all hover:bg-emerald-600 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.6)] active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
                >
                  <ShoppingBag className="size-5" />
                  Add to cart
                </button>
              </div>

              {/* Delivery Info */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-xl text-emerald-600 shadow-sm"><Truck className="size-5" /></div>
                  <div>
                    <div className="font-bold text-[#2C2C2E] text-sm mb-0.5">Delivery Time</div>
                    <div className="text-xs text-slate-500">{product.deliveryTime} (Fastest)</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm"><MapPin className="size-5" /></div>
                  <div>
                    <div className="font-bold text-[#2C2C2E] text-sm mb-0.5">Availability</div>
                    <div className="text-xs text-slate-500">Serviceable in your area</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Assistant Hook */}
            <div className="mt-8">
              <AIAssistant product={product} />
            </div>

            {/* Scroll-Linked Reveal Tabs */}
            <motion.div 
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 40 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
                {['details', 'nutrition', 'storage', 'reviews'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)} 
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative whitespace-nowrap ${activeTab === tab ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab === 'details' ? 'Description' : tab === 'nutrition' ? 'Nutrition Facts' : tab}
                    {activeTab === tab && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-emerald-500" />}
                  </button>
                ))}
              </div>
              
              <div className="py-8 text-base text-slate-600 font-medium leading-relaxed min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeTab === 'details' && (
                    <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p className="text-lg leading-relaxed mb-8">{product.description}</p>
                      
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <strong className="block text-[#2C2C2E] mb-2 flex items-center gap-2"><Info className="size-5 text-blue-500" /> Ingredients</strong>
                          {product.ingredients || "100% natural and pure ingredients."}
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <strong className="block text-[#2C2C2E] mb-2 flex items-center gap-2"><ShieldCheck className="size-5 text-emerald-500" /> FSSAI</strong>
                          Lic No. 10012022000213
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'nutrition' && (
                    <motion.div key="nutrition" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm max-w-md">
                      <div className="border-b-[10px] border-[#2C2C2E] pb-2 mb-4">
                        <h2 className="text-4xl font-black text-[#2C2C2E] uppercase tracking-tighter">Nutrition Facts</h2>
                        <div className="text-sm font-bold text-slate-500 mt-1">Serving Size 100g</div>
                      </div>
                      <div className="flex justify-between border-b-4 border-[#2C2C2E] pb-2 mb-4">
                        <span className="text-2xl font-black text-[#2C2C2E]">Calories</span>
                        <span className="text-2xl font-black text-[#2C2C2E]">120</span>
                      </div>
                      
                      {product.nutritionFacts ? product.nutritionFacts.map((fact, idx) => (
                        <div key={idx} className="flex justify-between border-b border-slate-300 py-2">
                          <span className="font-bold text-[#2C2C2E]">{fact.name}</span>
                          <span className="font-bold text-[#2C2C2E]">{fact.value}</span>
                        </div>
                      )) : (
                        <>
                          <div className="flex justify-between border-b border-slate-300 py-2"><span className="font-bold text-[#2C2C2E]">Total Fat</span><span className="font-bold text-[#2C2C2E]">0.5g</span></div>
                          <div className="flex justify-between border-b border-slate-300 py-2"><span className="font-bold text-[#2C2C2E]">Sodium</span><span className="font-bold text-[#2C2C2E]">10mg</span></div>
                          <div className="flex justify-between border-b border-slate-300 py-2"><span className="font-bold text-[#2C2C2E]">Total Carbohydrate</span><span className="font-bold text-[#2C2C2E]">28g</span></div>
                          <div className="flex justify-between py-2"><span className="font-bold text-[#2C2C2E]">Protein</span><span className="font-bold text-[#2C2C2E]">2g</span></div>
                        </>
                      )}
                    </motion.div>
                  )}
                  {activeTab === 'storage' && (
                    <motion.div key="storage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-900 mb-6">
                        <strong className="block mb-2 flex items-center gap-2"><Info className="size-5" /> Storage Instructions</strong>
                        {product.storage || "Store in a cool, dry place. Keep refrigerated after opening."}
                      </div>
                      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-amber-900">
                        <strong className="block mb-2 flex items-center gap-2"><Flame className="size-5" /> Shelf Life</strong>
                        {product.expiry || "Best before 6 months from packaging."}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === 'reviews' && (
                    <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <ProductReviews productId={product.id} rating={product.rating} count={product.reviews} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-12 lg:mt-32 mb-10 lg:mb-20 flex flex-col gap-8 lg:gap-16 relative z-10 border-t border-slate-100 pt-8 lg:pt-16">
          {frequentlyBought.length > 0 && (
            <RecommendationCarousel 
              title="Frequently Bought Together" 
              products={frequentlyBought} 
            />
          )}

          {customersAlsoBought.length > 0 && (
            <RecommendationCarousel 
              title="Customers Also Bought" 
              products={customersAlsoBought} 
            />
          )}

          {healthyAlternatives.length > 0 && (
            <RecommendationCarousel 
              title="Healthy Alternatives" 
              products={healthyAlternatives} 
            />
          )}

          {recentlyViewedProducts.length > 0 && (
            <RecommendationCarousel 
              title="Recently Viewed" 
              products={recentlyViewedProducts} 
            />
          )}
        </div>
      </motion.div>

      {/* Sticky Buy Bar (Desktop only) */}
      <motion.div 
        style={{ opacity: buyBarOpacity, y: buyBarY }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-200 p-4 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)] hidden lg:block"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <img src={product.images[0]} className="size-16 object-contain rounded-2xl bg-slate-50 border border-slate-100 p-2" />
            <div>
              <div className="font-bold text-[#2C2C2E] text-lg">{product.name}</div>
              <div className="font-bold text-emerald-600 flex items-center gap-2">
                {formatCurrency(product.price)}
                {product.compareAt && <span className="text-sm text-slate-400 line-through">{formatCurrency(product.compareAt)}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                triggerFlyToCart(e, product, () => triggerPulse());
                add(product, 1);
              }}
              className="h-14 px-8 rounded-full bg-slate-100 font-bold text-slate-700 hover:bg-slate-200 active:scale-95 flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="size-5" /> Add
            </button>
            <button
              onClick={(e) => {
                triggerFlyToCart(e, product, () => triggerPulse());
                add(product, qty);
              }}
              className="h-14 px-10 rounded-full bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 hover:shadow-xl active:scale-95 flex items-center justify-center transition-all text-lg"
            >
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sticky Buy Bar (Mobile only) */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-white border-t border-slate-100 p-3 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:hidden flex items-center justify-between gap-4 pb-safe">
          <div className="flex flex-col leading-none min-w-[80px]">
             {product.compareAt && (
               <span className="mb-0.5 text-[11px] font-bold text-slate-400 line-through">
                 {formatCurrency(product.compareAt)}
               </span>
             )}
             <span className="text-xl font-bold text-[#2C2C2E]">
               {formatCurrency(product.price)}
             </span>
          </div>
          <button
            onClick={(e) => {
              triggerFlyToCart(e, product, () => triggerPulse());
              add(product, 1);
            }}
            className="flex-1 h-[48px] rounded-xl bg-emerald-500 font-bold text-white shadow-[0_8px_16px_-8px_rgba(16,185,129,0.5)] active:scale-95 flex items-center justify-center gap-2 text-base transition-transform"
          >
            <ShoppingBag className="size-4" /> Add to cart
          </button>
      </div>
    </>
  );
}
