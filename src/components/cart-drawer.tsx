import { motion, AnimatePresence } from "framer-motion";
import { 
  Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, Zap, 
  Sparkles, Tag, ChevronLeft, ChevronRight, MapPin, Clock, 
  Ticket, CheckCircle2, AlertCircle, Percent
} from "lucide-react";
import { useCart, selectCartSubtotal } from "@/lib/cart-store";
import { Link, useNavigate } from "@tanstack/react-router";
import { DB, type Product } from "@/lib/enterprise-data";
import { useState, useEffect, useCallback, useMemo } from "react";
import { CouponService, type Coupon } from "@/lib/services/coupon-service";
import { RecommendationEngine } from "@/lib/recommendation-engine";
import { useAddressStore } from "@/lib/address-store";
import { PremiumCarousel } from "@/components/ui/premium-carousel";

const FREE_DELIVERY_THRESHOLD = 500;

export function CartDrawer() {
  const isOpen = useCart((s) => s.isDrawerOpen);
  const setIsOpen = useCart((s) => s.setIsDrawerOpen);
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const add = useCart((s) => s.add);
  const remove = useCart((s) => s.remove);
  const appliedCoupon = useCart((s) => s.appliedCoupon);
  const setAppliedCoupon = useCart((s) => s.setAppliedCoupon);
  
  const defaultAddress = useAddressStore((s) => s.defaultAddress);
  const displayAddress = defaultAddress 
    ? `${defaultAddress.line1}, ${defaultAddress.city}` 
    : "Select Address";

  const subtotal = useCart(selectCartSubtotal);
  // Re-calculate coupon discount if subtotal changes
  const [actualDiscount, setActualDiscount] = useState(0);

  const delivery = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? 29.00 : 0;
  const tax = subtotal * 0.05; // 5% GST
  
  // Recalculate discount based on percentage vs fixed if applied
  useEffect(() => {
    if (appliedCoupon) {
       CouponService.applyCoupon(appliedCoupon.code, subtotal).then(res => {
         if (res.success) {
           setActualDiscount(res.discountAmount);
           setAppliedCoupon({ code: appliedCoupon.code, discountAmount: res.discountAmount });
         } else {
           setActualDiscount(0);
           setAppliedCoupon(null);
         }
       });
    } else {
       setActualDiscount(0);
    }
  }, [subtotal]);

  const total = subtotal + delivery + tax - actualDiscount;
  const progress = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);
  const amountNeeded = Math.max(FREE_DELIVERY_THRESHOLD - subtotal, 0);
  const rewardPoints = Math.floor(subtotal / 10); // 1 point per 10 rupees

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    if (isOpen) {
      CouponService.getCoupons().then(setAvailableCoupons);
    }
  }, [isOpen]);

  const handleApplyCoupon = async (code: string) => {
    setCouponLoading(true);
    setCouponError("");
    const res = await CouponService.applyCoupon(code, subtotal);
    setCouponLoading(false);
    if (res.success) {
      setAppliedCoupon({ code, discountAmount: res.discountAmount });
      setActualDiscount(res.discountAmount);
      setCouponInput("");
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setActualDiscount(0);
  };

  // AI Recommendations
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  useEffect(() => {
    if (isOpen && lines.length > 0) {
      // Get AI recommendations based on the last item in cart
      const lastProd = lines[lines.length - 1].product;
      const recs = RecommendationEngine.getFrequentlyBoughtTogether(lastProd, 10);
      setSuggestions(recs.filter(r => !lines.some(l => l.product.id === r.id)));
    } else if (isOpen && lines.length === 0) {
      setSuggestions(RecommendationEngine.getTrendingNearYou(10));
    }
  }, [isOpen, lines]);

  // Prevent background scrolling
  if (typeof document !== 'undefined') {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
  }

  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsOpen(false);
    navigate({ to: "/checkout" });
    setIsCheckingOut(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className="fixed inset-y-0 right-0 z-[101] flex w-full max-w-[480px] flex-col bg-[#F9FAFB] shadow-[-20px_0_40px_rgba(0,0,0,0.1)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex flex-col border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#2C2C2E] leading-tight">Your Cart</h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">{lines.length} Items</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-[#2C2C2E] transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Delivery Info Strip */}
              {lines.length > 0 && (
                <div className="bg-slate-50 px-5 py-2.5 flex items-center justify-between border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <MapPin className="size-3.5 text-emerald-500" />
                    Delivery to: <span className="text-[#2C2C2E] truncate max-w-[120px]">{displayAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    <Clock className="size-3.5" /> 10 Mins ETA
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 no-scrollbar relative pb-32">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-6">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="grid size-24 place-items-center rounded-3xl bg-white shadow-sm mb-6 text-emerald-500"
                  >
                    <ShoppingBag className="size-10" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#2C2C2E] mb-2">Cart is empty</h3>
                  <p className="text-slate-500 font-medium mb-8">Good food is always cooking! Go ahead, order some yummy items.</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-500 active:scale-95 transition-all w-full max-w-[280px]"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  
                  {/* Free Delivery Bar */}
                  <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Sparkles className="size-16" />
                    </div>
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-500">
                          <Zap className="size-4" />
                        </div>
                        <p className="text-[13px] font-bold text-[#2C2C2E]">
                          {amountNeeded > 0 ? (
                            <>Add <span className="text-emerald-600">₹{amountNeeded.toFixed(2)}</span> for <span className="uppercase tracking-wider">Free Delivery</span></>
                          ) : (
                            <span className="text-emerald-600 uppercase tracking-wider">Free Delivery Unlocked!</span>
                          )}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                        ₹{subtotal.toFixed(0)} / ₹{FREE_DELIVERY_THRESHOLD}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'}`}
                      />
                    </div>
                    {/* Reward points */}
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg w-max">
                      <Sparkles className="size-3" /> You will earn {rewardPoints} Reward Points
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="bg-white rounded-[24px] p-2 shadow-sm border border-slate-100">
                    <ul className="divide-y divide-slate-50">
                      <AnimatePresence mode="popLayout">
                        {lines.map((line) => (
                          <motion.li
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, x: -20 }}
                            key={line.product.id}
                            className="flex gap-4 p-3 group relative"
                          >
                            <div className="w-[72px] h-[72px] rounded-[16px] bg-[#F8F9FA] flex items-center justify-center p-2 shrink-0 border border-slate-100">
                              <img
                                src={line.product.images?.[0] || line.product.image}
                                alt={line.product.name}
                                className="h-full w-full object-contain mix-blend-multiply"
                              />
                            </div>
                            
                            <div className="flex flex-1 flex-col py-0.5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-bold text-[#2C2C2E] line-clamp-1 text-[14px]">{line.product.name}</p>
                                  <p className="text-[12px] font-semibold text-slate-500 mt-0.5">
                                    {line.product.weight} {line.product.unit}
                                  </p>
                                </div>
                                <button
                                  onClick={() => remove(line.product.id)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors shrink-0"
                                >
                                  <X className="size-4" />
                                </button>
                              </div>
                              
                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-[#2C2C2E] text-[15px]">
                                    ₹{line.product.price.toFixed(2)}
                                  </p>
                                  {line.product.discount > 0 && (
                                    <span className="text-[10px] font-bold text-slate-400 line-through decoration-slate-300">
                                      ₹{Math.round(line.product.price / (1 - line.product.discount / 100))}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 rounded-[12px] bg-emerald-50 p-1 border border-emerald-100/50">
                                  <button
                                    onClick={() => setQty(line.product.id, line.qty - 1)}
                                    className="grid size-6 place-items-center rounded-[8px] bg-white text-emerald-600 hover:bg-emerald-100 shadow-sm transition-all"
                                  >
                                    <Minus className="size-3.5" strokeWidth={3} />
                                  </button>
                                  <span className="w-6 text-center text-[13px] font-bold text-emerald-700">
                                    {line.qty}
                                  </span>
                                  <button
                                    onClick={() => setQty(line.product.id, line.qty + 1)}
                                    className="grid size-6 place-items-center rounded-[8px] bg-emerald-500 text-white shadow-sm transition-all hover:bg-emerald-600"
                                  >
                                    <Plus className="size-3.5" strokeWidth={3} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>

                  {/* Coupons Section */}
                  <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100">
                    <h3 className="text-[14px] font-bold text-[#2C2C2E] mb-3 flex items-center gap-2">
                      <Ticket className="size-4 text-emerald-500" /> Apply Coupon
                    </h3>
                    
                    {appliedCoupon ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 border border-emerald-200/60 rounded-[16px] p-3 flex justify-between items-center"
                      >
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1.5">
                            <CheckCircle2 className="size-4" /> {appliedCoupon.code}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                            Saved ₹{actualDiscount.toFixed(2)} on this order
                          </span>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-emerald-700 font-bold text-xs">
                          Remove
                        </button>
                      </motion.div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex gap-2 relative">
                          <input 
                            type="text" 
                            placeholder="Enter coupon code" 
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-3 py-2.5 text-sm font-bold text-[#2C2C2E] uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                          <button 
                            disabled={!couponInput || couponLoading}
                            onClick={() => handleApplyCoupon(couponInput)}
                            className="bg-[#2C2C2E] text-white px-5 rounded-[12px] text-[13px] font-bold hover:bg-black disabled:opacity-50 transition-colors"
                          >
                            {couponLoading ? "..." : "Apply"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                            <AlertCircle className="size-3" /> {couponError}
                          </p>
                        )}
                        
                        {/* Available Coupons Horizontal List */}
                        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                          {availableCoupons.filter(c => c.status === "AVAILABLE").map(c => (
                            <button 
                              key={c.id} 
                              onClick={() => handleApplyCoupon(c.code)}
                              className="shrink-0 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group"
                            >
                              <div className="bg-slate-50 p-1.5 rounded-lg group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                <Percent className="size-3.5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[12px] font-bold text-[#2C2C2E] leading-tight">{c.code}</span>
                                <span className="text-[10px] font-medium text-slate-500">{c.title}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bill Details */}
                  <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100">
                    <h3 className="text-[14px] font-bold text-[#2C2C2E] mb-4">Bill Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                        <span>Items Total</span>
                        <span className="font-bold text-[#2C2C2E]">₹{subtotal.toFixed(2)}</span>
                      </div>
                      
                      {actualDiscount > 0 && (
                        <div className="flex justify-between text-[13px] text-emerald-600 font-bold">
                          <span>Coupon Discount</span>
                          <span>-₹{actualDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                        <span>Delivery Fee</span>
                        {delivery === 0 ? (
                          <span className="font-bold text-emerald-500 uppercase tracking-wide">Free</span>
                        ) : (
                          <span className="font-bold text-[#2C2C2E]">₹{delivery.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="flex justify-between text-[13px] text-slate-600 font-medium">
                        <span>Taxes (5% GST)</span>
                        <span className="font-bold text-[#2C2C2E]">₹{tax.toFixed(2)}</span>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 border-dashed flex justify-between items-center">
                        <span className="font-bold text-[#2C2C2E] text-[15px]">Grand Total</span>
                        <span className="text-[18px] font-black text-[#2C2C2E]">₹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {suggestions.length > 0 && (
                    <div className="pt-4 pb-8">
                      <PremiumCarousel
                        title={<><Sparkles className="size-4 text-emerald-500" /> Complete your order</>}
                        items={suggestions}
                        showPagination={false}
                        autoPlay={false}
                        viewportClassName="-mx-4 px-4"
                        containerClassName="gap-3"
                        options={{ slidesToScroll: 2 }}
                        renderItem={(prod) => (
                          <div key={prod.id} className="flex-[0_0_120px] min-w-0">
                            <div className="w-full bg-white rounded-[16px] p-2.5 border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
                               <div className="w-full h-[80px] bg-slate-50 rounded-[10px] p-2 mb-2 relative group flex items-center justify-center">
                                 <img src={prod.images?.[0] || prod.image} alt={prod.name} className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform" />
                                 <button 
                                   onClick={() => add(prod)}
                                   className="absolute -bottom-2 right-1 size-7 bg-white text-emerald-600 rounded-full shadow border border-emerald-100 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors active:scale-95"
                                 >
                                   <Plus className="size-3.5" strokeWidth={3} />
                                 </button>
                               </div>
                               <p className="text-[11px] font-bold text-[#2C2C2E] line-clamp-2 leading-tight mb-1">{prod.name}</p>
                               <div className="mt-auto">
                                 <span className="text-[12px] font-bold text-[#2C2C2E]">₹{prod.price}</span>
                               </div>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Sticky Checkout Footer */}
            {lines.length > 0 && (
              <div className="absolute bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] z-30 border-t border-white">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full flex items-center justify-between px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold h-14 rounded-[16px] shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all active:scale-[0.98] group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  
                  {isCheckingOut ? (
                    <div className="w-full flex items-center justify-center gap-2">
                       <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-widest leading-none mb-0.5">Pay Using</span>
                        <span className="text-[16px] font-black leading-none flex items-center gap-1.5">
                          ₹{total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-[10px]">
                        <span className="text-[14px]">Checkout</span>
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


