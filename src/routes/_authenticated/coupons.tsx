import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Ticket, CheckCircle2, Clock, Copy, Search, Tag, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CouponService, Coupon } from "@/lib/services/coupon-service";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/coupons")({
  head: () => ({ meta: [{ title: "Coupons & Offers — Himanshu Store" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const goBack = useNavigateBack();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"AVAILABLE" | "USED" | "EXPIRED">("AVAILABLE");

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await CouponService.getCoupons();
      setCoupons(data);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code ${code} copied to clipboard!`);
  };

  const filteredCoupons = coupons.filter(c => c.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-orange-100 selection:text-orange-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-bold text-[#1C1C1E] tracking-tight text-[17px]">Coupons & Offers</h1>
        <div className="size-10" />
      </header>

      {/* Hero Section */}
      <div className="bg-[#1C1C1E] pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]" />
        
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.4)] mb-4">
            <Ticket className="size-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Your Offers</h2>
          <p className="text-slate-400 text-sm font-medium">Save more on every order with exclusive coupons.</p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 -mt-8 relative z-20">
        
        {/* Tabs */}
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-slate-100 mb-6">
          {(["AVAILABLE", "USED", "EXPIRED"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all capitalize ${
                filter === tab 
                  ? 'bg-orange-50 text-orange-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-white rounded-[24px] animate-pulse shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[32px] border border-slate-100 shadow-sm mt-4">
            <Tag className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1C1C1E] mb-1">No {filter.toLowerCase()} coupons</h3>
            <p className="text-slate-500 text-sm">You don't have any {filter.toLowerCase()} coupons right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredCoupons.map((coupon) => (
                <motion.div
                  key={coupon.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white rounded-[24px] border shadow-sm transition-all overflow-hidden flex flex-col sm:flex-row relative ${
                    coupon.status === 'AVAILABLE' ? 'border-orange-100 hover:border-orange-200 hover:shadow-orange-500/5' : 'border-slate-100 opacity-70'
                  }`}
                >
                  {/* Left Side: Discount Value */}
                  <div className={`p-6 sm:w-1/3 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-dashed ${
                    coupon.status === 'AVAILABLE' ? 'bg-orange-50/50 border-orange-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {coupon.discountType === 'PERCENT' ? (
                      <span className="text-4xl font-black text-orange-600 tracking-tighter">{coupon.discountValue}%</span>
                    ) : (
                      <span className="text-4xl font-black text-orange-600 tracking-tighter">₹{coupon.discountValue}</span>
                    )}
                    <span className="text-xs font-bold text-orange-600/70 uppercase tracking-widest mt-1">OFF</span>
                  </div>

                  {/* Right Side: Details */}
                  <div className="p-6 sm:w-2/3 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-[#1C1C1E] text-lg leading-tight">{coupon.title}</h3>
                      {coupon.status === 'AVAILABLE' && (
                        <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0">
                          <Sparkles className="size-3" /> Valid
                        </span>
                      )}
                    </div>
                    
                    <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2">{coupon.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-medium text-slate-400 flex flex-col gap-0.5">
                        <span>Min Order: <strong className="text-slate-600">{formatCurrency(coupon.minOrderValue)}</strong></span>
                        <span className="flex items-center gap-1"><Clock className="size-3" /> Ends: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                      </div>
                      
                      {coupon.status === 'AVAILABLE' ? (
                        <button 
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
                        >
                          Copy <Copy className="size-4" />
                        </button>
                      ) : coupon.status === 'USED' ? (
                        <span className="flex items-center gap-1 text-slate-400 font-bold text-sm"><CheckCircle2 className="size-4" /> Used</span>
                      ) : (
                        <span className="text-slate-400 font-bold text-sm line-through">Expired</span>
                      )}
                    </div>
                  </div>

                  {/* Decorative cutouts */}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 size-6 bg-slate-50 rounded-full border-r border-slate-100 hidden sm:block" />
                  <div className="absolute top-1/2 -translate-y-1/2 -right-3 size-6 bg-slate-50 rounded-full border-l border-slate-100 hidden sm:block" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
