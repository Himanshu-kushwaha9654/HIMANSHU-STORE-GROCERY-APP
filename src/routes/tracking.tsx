import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  ArrowLeft, Crosshair, MapPin, Check, 
  MessageSquare, Phone, ShieldCheck, Star,
  Share2, Store, PackageOpen, Bike, Home, ShoppingBag, Receipt, HelpCircle, X, ThumbsUp, RefreshCw, ChevronRight, CheckCircle2, Truck
} from "lucide-react";
import { motion, AnimatePresence, useMotionValue, animate, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { OrderService } from "@/lib/api/order-service";
import { Order } from "@/lib/order-store";
import { supabase } from "@/integrations/supabase/client";

const TrackingMap = lazy(() => import("@/components/tracking-map"));

export const Route = createFileRoute("/tracking")({
  head: () => ({
    meta: [{ title: "Live Tracking — Premium Order" }],
  }),
  component: LiveTrackingPage,
});

// A highly styled SVG path for the bike
const ROUTE_PATH_D = "M 80,120 C 180,120 220,180 200,280 C 180,380 280,350 350,420";

function LiveTrackingPage() {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  // Fast-forward demo state removed for Real-Time Supabase tracking
  const [notification, setNotification] = useState<{ id: number, text: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    const orders = await OrderService.getOrders();
    const active = orders.find(o => 
      o.status !== 'Delivered' && o.status !== 'Cancelled'
    ) || orders[0];
    if (active) {
       setOrder(active);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchOrder();
  }, []);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#10B981', '#3B82F6', '#ffffff'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#10B981', '#3B82F6', '#ffffff'] });
    }, 250);
  };

  // Subscribe to real-time changes
  useEffect(() => {
    if (!order) return;
    
    const channel = supabase.channel(`public:orders:${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          fetchOrder();
          
          // Show notification
          const newStatus = payload.new.order_status;
          let text = "Your order status was updated!";
          if (newStatus === 'accepted') text = "Store has accepted your order 📦";
          if (newStatus === 'packing') text = "Your order is being packed 🛒";
          if (newStatus === 'out_for_delivery') text = "Rider picked up your groceries 🛵";
          if (newStatus === 'delivered') {
             text = "Your order was delivered! 🎉";
             triggerConfetti();
          }
          
          const id = Date.now();
          setNotification({ id, text });
          setTimeout(() => setNotification(null), 4000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);
  
  const bikeProgress = useMotionValue(0);

  // Status milestones
  const steps = [
    { title: "Confirmed", icon: ShoppingBag },
    { title: "Accepted", icon: Store },
    { title: "Packing", icon: PackageOpen },
    { title: "Out for Delivery", icon: Bike },
    { title: "Delivered", icon: Home },
  ];

  const isDelivered = order?.status === 'Delivered';

  let progressPct = 0.1;
  let currentStepIndex = 0;
  
  if (order?.status === 'Delivered') { progressPct = 1; currentStepIndex = 4; }
  else if (order?.status === 'Out for Delivery') { progressPct = 0.75; currentStepIndex = 3; }
  else if (order?.status === 'Packed') { progressPct = 0.6; currentStepIndex = 2; }
  else if (order?.status === 'Preparing Order') { progressPct = 0.5; currentStepIndex = 2; }
  else if (order?.status === 'Payment Confirmed') { progressPct = 0.3; currentStepIndex = 1; }

  // Smoothly animate the bike matching progress
  useEffect(() => {
    animate(bikeProgress, progressPct, {
      duration: 1, 
      ease: "linear",
    });
  }, [progressPct, bikeProgress]);
  
  // Calculate displayed ETA
  let minutes = 15;
  let seconds = 0;
  if (order?.estimatedDelivery) {
     const diff = new Date(order.estimatedDelivery).getTime() - Date.now();
     if (diff > 0) {
       minutes = Math.floor(diff / 60000);
       seconds = Math.floor((diff % 60000) / 1000);
     }
  } else {
    // Fake ETA based on progress
    const simulatedEtaSeconds = Math.max(0, Math.floor(15 * 60 * (1 - progressPct)));
    minutes = Math.floor(simulatedEtaSeconds / 60);
    seconds = simulatedEtaSeconds % 60;
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Truck className="size-10 text-emerald-500 mb-4" />
          <p className="text-slate-500 font-bold">Loading Live Tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-white md:bg-slate-50 font-sans">
      
      {/* 
        ====================================================
        TOP NAVIGATION SECTION
        ====================================================
      */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/")} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 text-slate-700">
          <ArrowLeft className="size-5" />
        </button>
        <div className="text-center flex flex-col items-center">
          <h1 className="font-bold text-[#2C2C2E] tracking-tight text-[15px]">Track Order</h1>
          <p className="font-bold text-emerald-600 text-[11px] uppercase tracking-widest mt-0.5">{order.displayId}</p>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 text-slate-700">
          <Share2 className="size-5" />
        </button>
      </header>

      {/* Floating Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm flex items-center gap-3 w-[90%] max-w-sm"
          >
            <span className="text-xl animate-bounce">{notification.text.slice(-2)}</span>
            {notification.text.slice(0, -2)}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col md:flex-row w-full max-w-[1400px] mx-auto relative">
        
        {/* 
          ====================================================
          LIVE MAP SECTION (Top on Mobile, Left on Desktop)
          ====================================================
        */}
        <div className="relative w-full h-[55vh] md:h-[calc(100vh-65px)] md:w-[50%] lg:w-[60%] bg-[#E8F0EB] md:sticky md:top-[65px] overflow-hidden shrink-0">
          
          {/* Leaflet Map Background */}
          <div className="absolute inset-0 bg-slate-100 z-0 overflow-hidden">
             {/* Map Integration */}
             {isMounted && (
               <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-medium">Loading Map...</div>}>
                 <TrackingMap progressPct={progressPct} isDelivered={isDelivered} />
               </Suspense>
             )}
          </div>

          {/* 
            ====================================================
            LIVE ETA CARD (Glassmorphism overlay on map)
            ====================================================
          */}
          <div className="absolute top-4 left-4 right-4 md:left-6 md:right-6 lg:w-[400px] lg:right-auto z-30">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white/85 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/60 flex flex-col gap-4"
            >
              {/* ETA Display */}
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                <div>
                  <h3 className="font-semibold text-slate-500 text-xs uppercase tracking-widest mb-0.5">
                    {isDelivered ? 'Status' : 'Estimated Arrival'}
                  </h3>
                  <div className="text-3xl font-bold text-[#2C2C2E] tracking-tighter flex items-center gap-2">
                    {isDelivered ? 'Delivered 🎉' : `${minutes}:${seconds.toString().padStart(2, '0')}`}
                  </div>
                </div>
                {!isDelivered && (
                  <div className="size-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-pulse">
                    <Crosshair className="size-6 text-emerald-500" />
                  </div>
                )}
              </div>

              {/* Rider Info */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Driver" className="size-12 rounded-full object-cover shadow-inner" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <ShieldCheck className="size-3 text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#2C2C2E] tracking-tight text-sm truncate">{order.deliveryPartner?.name || 'Rahul Sharma'}</h3>
                    <div className="flex items-center gap-0.5 bg-slate-100 px-1 py-0.5 rounded text-[10px] font-bold text-slate-700">
                      <Star className="size-2.5 fill-amber-400 text-amber-400" /> {order.deliveryPartner?.rating || 4.9}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest truncate mt-0.5">{order.deliveryPartner?.phone || 'MH12 AB 1234'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors active:scale-95">
                    <MessageSquare className="size-4 fill-slate-400" />
                  </button>
                  <button className="size-10 bg-emerald-500 rounded-full flex items-center justify-center text-white hover:bg-emerald-600 shadow-[0_5px_15px_-5px_rgba(16,185,129,0.5)] transition-all active:scale-95">
                    <Phone className="size-4 fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Delivery Confetti Overlay on Map */}
          <AnimatePresence>
            {isDelivered && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
              >
                <motion.div 
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="bg-emerald-500 size-24 rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.4)] rotate-3"
                >
                  <Check className="size-12 text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 
          ====================================================
          SCROLLABLE DETAILS SECTION (Bottom half on mobile, Right on Desktop)
          ====================================================
        */}
        <div className="flex-1 bg-white md:bg-white rounded-t-[32px] md:rounded-none -mt-6 md:mt-0 relative z-20 md:z-0 shadow-[0_-15px_40px_rgba(0,0,0,0.08)] md:shadow-none p-6 md:p-10 flex flex-col gap-8 pb-32">
          
          {/* Mobile Handle (Optional visual hint) */}
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto md:hidden -mt-2 mb-2" />

          {/* 
            ====================================================
            HORIZONTAL TIMELINE
            ====================================================
          */}
          <section>
            <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-6">Order Status</h2>
            <div className="relative flex justify-between items-start">
              
              {/* Background Connecting Line */}
              <div className="absolute top-[18px] left-[10%] right-[10%] h-[3px] bg-slate-100 rounded-full -z-10" />
              
              {/* Active Connecting Line */}
              <div className="absolute top-[18px] left-[10%] h-[3px] bg-emerald-500 rounded-full -z-10 transition-all duration-1000 ease-out"
                   style={{ width: `${(currentStepIndex / (steps.length - 1)) * 80}%` }} 
              />

              {steps.map((step, i) => {
                const isPast = i < currentStepIndex;
                const isActive = i === currentStepIndex;
                const Icon = step.icon;
                
                return (
                  <div key={i} className="flex flex-col items-center gap-2 relative w-[20%]">
                    <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                      isPast || (isActive && isDelivered) 
                        ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : isActive 
                          ? 'bg-white border-[3px] border-emerald-500 text-emerald-500 animate-pulse' 
                          : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}>
                      <Icon className="size-4" strokeWidth={2.5} />
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors ${
                      isActive ? 'text-[#2C2C2E]' : isPast ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 
            ====================================================
            DELIVERY DETAILS
            ====================================================
          */}
          <section className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 flex flex-col gap-3">
             <div className="flex gap-3">
               <div className="size-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-emerald-600">
                 <MapPin className="size-4" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-[#2C2C2E]">Delivery Address</h4>
                 <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-relaxed">{order.address.street}, {order.address.city}, {order.address.state} {order.address.pincode}</p>
               </div>
             </div>
          </section>

          <hr className="border-slate-100" />

          {/* 
            ====================================================
            ORDER ITEMS
            ====================================================
          */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight">Order Items</h2>
              <span className="font-bold text-slate-400 text-sm">{order.items.reduce((a,b)=>a+b.qty, 0)} items</span>
            </div>
            
            <div className="flex flex-col gap-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 shrink-0">
                    <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#2C2C2E] text-sm truncate">{item.name}</h4>
                    <p className="font-bold text-slate-500 text-xs mt-0.5">Qty: {item.qty}</p>
                  </div>
                  <div className="font-bold text-[#2C2C2E]">
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* 
            ====================================================
            BILL SUMMARY
            ====================================================
          */}
          <section>
            <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-4">Bill Summary</h2>
            <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 flex flex-col gap-3">
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>Subtotal</span>
                <span className="text-[#2C2C2E]">{formatCurrency(order.priceBreakdown.subtotal)}</span>
              </div>
              {order.priceBreakdown.discount > 0 && (
                <div className="flex justify-between text-sm font-semibold text-emerald-600">
                  <span>Product Discount</span>
                  <span>-{formatCurrency(order.priceBreakdown.discount)}</span>
                </div>
              )}
              {order.priceBreakdown.couponDiscount > 0 && (
                <div className="flex justify-between text-sm font-semibold text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(order.priceBreakdown.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>Delivery Fee</span>
                <span className="text-[#2C2C2E]">{order.priceBreakdown.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.priceBreakdown.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-slate-500">
                <span>Platform Fee</span>
                <span className="text-[#2C2C2E]">{formatCurrency(order.priceBreakdown.platformFee)}</span>
              </div>
              {order.priceBreakdown.gst > 0 && (
                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>GST (Taxes)</span>
                  <span className="text-[#2C2C2E]">{formatCurrency(order.priceBreakdown.gst)}</span>
                </div>
              )}
              <div className="w-full h-px bg-slate-200 my-1" />
              <div className="flex justify-between items-center text-lg font-bold text-[#2C2C2E]">
                <span>Total Paid</span>
                <span>{formatCurrency(order.priceBreakdown.total)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold w-fit">
                <CheckCircle2 className="size-4" /> Paid via {order.paymentMethod}
              </div>
            </div>
          </section>

          {/* 
            ====================================================
            BOTTOM ACTIONS
            ====================================================
          */}
          <AnimatePresence mode="wait">
            {!isDelivered ? (
              <motion.section 
                key="tracking-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-3 mt-4"
              >
                <Button variant="outline" className="h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50">
                  <HelpCircle className="size-4 mr-2 text-slate-500" /> Support
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl font-bold border-slate-200 hover:bg-slate-50">
                  <MapPin className="size-4 mr-2 text-slate-500" /> Track Rider
                </Button>
                <Button variant="outline" className="h-14 rounded-2xl font-bold text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600">
                  <X className="size-4 mr-2" /> Cancel Order
                </Button>
                <Button className="h-14 rounded-2xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-lg active:scale-95 transition-all">
                  <RefreshCw className="size-4 mr-2" /> Reorder
                </Button>
              </motion.section>
            ) : (
              <motion.section 
                key="delivered-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 mt-4"
              >
                <div className="bg-emerald-50 rounded-2xl p-4 flex items-center justify-between border border-emerald-100 mb-2">
                  <div>
                    <h3 className="font-semibold text-emerald-800 text-sm">How was your delivery?</h3>
                    <p className="text-emerald-600 text-xs font-semibold">Rate Rahul's service</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="size-10 bg-white rounded-full shadow-sm text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center">
                      <ThumbsUp className="size-5 rotate-180" />
                    </button>
                    <button className="size-10 bg-white rounded-full shadow-sm text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center">
                      <ThumbsUp className="size-5" />
                    </button>
                  </div>
                </div>
                <Button className="h-14 rounded-2xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full text-lg">
                  <RefreshCw className="size-5 mr-2" /> Reorder this list
                </Button>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

