import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { OrderService } from "@/lib/api/order-service";
import { Order } from "@/lib/order-store";
import { formatCurrency } from "@/lib/currency";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { 
  ArrowLeft, MapPin, Receipt, RefreshCw, 
  ShoppingBag, Star, CheckCircle2, Package, Truck, Phone, MessageSquare, XCircle
} from "lucide-react";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({
    meta: [{ title: "Order Details — Himanshu Store" }],
  }),
  component: OrderDetailsPage,
});

function getStatusSteps(status: string) {
  if (status === 'Cancelled' || status === 'Refunded') {
    return [
      { label: "Order Placed", icon: ShoppingBag },
      { label: status, icon: XCircle }
    ];
  }
  
  return [
    { label: "Order Placed", icon: ShoppingBag },
    { label: "Payment Confirmed", icon: CheckCircle2 },
    { label: "Preparing Order", icon: Package },
    { label: "Packed", icon: Package },
    { label: "Delivery Partner Assigned", icon: Truck },
    { label: "Out for Delivery", icon: Truck },
    { label: "Arriving Soon", icon: Truck },
    { label: "Delivered", icon: CheckCircle2 }
  ];
}

function OrderDetailsPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { add } = useCart();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    OrderService.getOrderById(id).then(data => {
      setOrder(data || null);
      if (data?.review) {
        setRating(data.review.rating);
        setReviewText(data.review.comment || "");
      }
      setLoading(false);
    });
  }, [id]);

  const handleReorder = async () => {
    if (!order) return;
    const promise = new Promise(resolve => {
      setTimeout(() => {
        order.items.forEach(item => add({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.img,
        quantity: item.qty
      }));
        resolve(true);
      }, 500);
    });

    toast.promise(promise, {
      loading: 'Adding items to cart...',
      success: 'All items added to cart!',
      error: 'Failed to reorder'
    });
    
    await promise;
    navigate({ to: "/cart" });
  };

  const handleRate = async () => {
    if (!order || rating === 0) return;
    await OrderService.rateOrder(order.id, { rating, comment: reviewText, date: new Date().toISOString() });
    toast.success("Thanks for your feedback!");
    // Update local state to reflect UI change immediately
    setOrder({ ...order, review: { rating, comment: reviewText, date: new Date().toISOString() } });
  };

  const handleDownloadInvoice = () => {
    toast.success("Invoice downloading...");
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] p-4 flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="h-20 bg-white rounded-3xl animate-pulse" />
        <div className="h-64 bg-white rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] bg-[#FAFAF9] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#2C2C2E] mb-2">Order Not Found</h1>
          <Link to="/orders" className="text-emerald-600 font-bold hover:underline">Return to Orders</Link>
        </div>
      </div>
    );
  }

  const steps = getStatusSteps(order.status);
  let currentStepIndex = steps.findIndex(s => s.label === order.status);
  if (currentStepIndex === -1 && (order.status !== 'Cancelled' && order.status !== 'Refunded')) currentStepIndex = steps.length - 1;

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => goBack("/orders")}
              className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="size-5 text-slate-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#2C2C2E] tracking-tight">{order.displayId}</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <button onClick={handleDownloadInvoice} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
            Invoice
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 py-6 flex flex-col gap-6 pb-32">
        
        {/* Timeline */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-6">Order Status</h2>
          
          <div className="relative flex justify-between items-start">
            <div className="absolute top-[18px] left-[5%] right-[5%] h-[3px] bg-slate-100 rounded-full -z-10" />
            <div className="absolute top-[18px] left-[5%] h-[3px] bg-emerald-500 rounded-full -z-10 transition-all duration-1000 ease-out"
                 style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 90}%` }} 
            />

            <div className="flex justify-between w-full relative z-10">
              {steps.map((step, i) => {
                const isPast = i <= currentStepIndex;
                const isActive = i === currentStepIndex;
                const isCancelled = (order.status === 'Cancelled' || order.status === 'Refunded') && i === 1;
                const Icon = step.icon;
                
                return (
                  <div key={i} className="flex flex-col items-center gap-2 relative w-16 sm:w-20">
                    <motion.div 
                      initial={isActive ? { scale: 0.8 } : false}
                      animate={isActive ? { scale: 1 } : false}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className={`size-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                      isCancelled ? 'bg-rose-500 text-white shadow-md' :
                      isPast 
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                        : 'bg-white border-2 border-slate-200 text-slate-300'
                    }`}>
                      <Icon className="size-4" strokeWidth={2.5} />
                    </motion.div>
                    <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${
                      isCancelled ? 'text-rose-600' :
                      isActive ? 'text-[#2C2C2E]' : isPast ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {['Out for Delivery', 'Packed', 'Payment Confirmed', 'Preparing Order', 'Delivery Partner Assigned', 'Arriving Soon'].includes(order.status) && (
            <div className="mt-8 flex gap-3">
              <Link to="/tracking" className="flex-1 flex items-center justify-center gap-2 bg-[#2C2C2E] hover:bg-black text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all">
                <Truck className="size-5" /> Live Tracking
              </Link>
              {['Order Placed', 'Payment Confirmed', 'Preparing Order'].includes(order.status) && (
                <button 
                  onClick={() => toast.success("Order cancelled successfully.")}
                  className="px-6 py-4 rounded-2xl font-bold border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95"
                >
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </section>

        {/* Order Items */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight">Items ({order.items.reduce((a,b)=>a+b.qty, 0)})</h2>
          </div>
          <div className="flex flex-col gap-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="size-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2C2C2E] text-sm truncate">{item.name}</h3>
                  <p className="font-bold text-slate-500 text-xs mt-0.5">Qty: {item.qty}</p>
                </div>
                <div className="font-bold text-[#2C2C2E]">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Price Breakdown */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-4">Bill Summary</h2>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm font-semibold text-slate-500">
              <span>Item Total</span>
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
              <span>Delivery Charge</span>
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
            <div className="w-full h-px bg-slate-100 my-1" />
            <div className="flex justify-between items-center text-lg font-bold text-[#2C2C2E]">
              <span>Grand Total</span>
              <span>{formatCurrency(order.priceBreakdown.total)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold border border-slate-100">
                Paid via {order.paymentMethod}
              </div>
              <div className={`px-3 py-2 rounded-xl text-xs font-bold border ${order.paymentStatus === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : order.paymentStatus === 'Refunded' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {order.paymentStatus}
              </div>
            </div>
          </div>
        </section>

        {/* Address & Partner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-4">Delivery To</h2>
            <div className="flex gap-3">
              <MapPin className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#2C2C2E] text-sm">{order.address.name}</h3>
                <p className="text-sm font-medium text-slate-600 mt-1 leading-relaxed">
                  {order.address.street}<br/>
                  {order.address.city}, {order.address.state} {order.address.pincode}
                </p>
                <p className="text-sm font-bold text-slate-500 mt-2">{order.address.phone}</p>
              </div>
            </div>
          </section>

          {order.deliveryPartner && (
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="font-bold text-[#2C2C2E] text-lg tracking-tight mb-4">Delivery Partner</h2>
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${order.deliveryPartner.name}&background=10B981&color=fff`} className="size-12 rounded-full shadow-sm" alt="Partner" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2C2C2E] text-sm truncate">{order.deliveryPartner.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-slate-600">{order.deliveryPartner.rating}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="size-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
                    <MessageSquare className="size-4" />
                  </button>
                  <button className="size-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <Phone className="size-4" />
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Rating Section (If delivered) */}
        {order.status === 'Delivered' && (
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center">
            {order.review ? (
              <div className="flex flex-col items-center">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`size-6 ${star <= order.review!.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                  ))}
                </div>
                <h3 className="font-bold text-[#2C2C2E] mb-1">Thanks for rating!</h3>
                {order.review.comment && <p className="text-sm font-medium text-slate-600">"{order.review.comment}"</p>}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-[#2C2C2E] text-lg mb-1">Rate your experience</h3>
                <p className="text-sm font-medium text-slate-500 mb-4">How was the delivery and product quality?</p>
                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="group outline-none">
                      <Star className={`size-10 transition-all ${rating >= star ? 'fill-amber-400 text-amber-400 scale-110' : 'fill-slate-100 text-slate-200 group-hover:scale-110'}`} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="w-full max-w-sm flex flex-col gap-3">
                    <textarea 
                      placeholder="Leave an optional review..." 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none resize-none h-20 text-[#2C2C2E]"
                    />
                    <button onClick={handleRate} className="w-full bg-[#2C2C2E] text-white py-3 rounded-xl font-bold hover:bg-black transition-colors active:scale-95">
                      Submit Rating
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={handleReorder} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all text-base md:text-lg">
            <RefreshCw className="size-5" /> Reorder All Items
          </button>
        </div>
      </div>

    </div>
  );
}

