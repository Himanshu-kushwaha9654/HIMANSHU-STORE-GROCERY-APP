import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useFlyToCart } from "@/components/fly-to-cart-provider";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useCart, selectCartSubtotal } from "@/lib/cart-store";
import { 
  Check, MapPin, Building2, Home, CreditCard, Wallet, 
  Smartphone, Plus, ShieldCheck, ChevronRight, 
  CheckCircle2, ArrowLeft, Loader2, Tag, Percent, Map, Navigation,
  Zap, Clock, CalendarDays, Receipt, FileText
} from "lucide-react";
import confetti from "canvas-confetti";
import { formatCurrency } from "@/lib/currency";
import { useAddressStore } from "@/lib/address-store";
import { useProfileStore } from "@/lib/profile-store";
import { ProfileService } from "@/lib/services/profile-service";
import { OrderService } from "@/lib/api/order-service";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Secure Checkout — Himanshu Store" }],
  }),
  component: CheckoutPage,
});


const DELIVERY_OPTIONS = [
  { id: "express", name: "Lightning Express", time: "10 mins", price: 49, icon: <Zap className="size-6 text-amber-500 fill-amber-500" /> },
  { id: "standard", name: "Standard Delivery", time: "30-45 mins", price: 29, icon: <Clock className="size-6 text-blue-500" /> },
  { id: "schedule", name: "Schedule Delivery", time: "Choose slot", price: 0, icon: <CalendarDays className="size-6 text-purple-500" /> },
];

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI", desc: "Google Pay, PhonePe, Paytm, BHIM", icon: Smartphone, tag: "Recommended" },
  { id: "card", name: "Credit / Debit Card", desc: "Visa, MasterCard, RuPay", icon: CreditCard },
  { id: "cod", name: "Cash on Delivery", desc: "Pay when your order arrives", icon: CheckCircle2 },
  { id: "wallet", name: "Wallet", desc: "Reward Points / Wallet Balance", icon: Wallet },
];

const SUGGESTED_COUPONS = [
  { code: "SAVE20", desc: "Flat 20% Off" },
  { code: "FIRSTORDER", desc: "Welcome Offer" },
  { code: "FREESHIP", desc: "Free Delivery" }
];

// Rolling number component for sleek price updates
function AnimatedPrice({ value, bold = true, className = "" }: { value: number, bold?: boolean, className?: string }) {
  return (
    <div className={`relative overflow-hidden inline-flex items-center ${bold ? 'font-bold' : 'font-semibold'} ${className}`}>
       <span className="text-inherit opacity-70 mr-0.5 font-sans">₹</span>
       <AnimatePresence mode="popLayout">
         <motion.span
           key={value}
           initial={{ y: -15, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           exit={{ y: 15, opacity: 0 }}
           transition={{ type: "spring", stiffness: 300, damping: 25 }}
         >
           {Math.round(value).toLocaleString('en-IN')}
         </motion.span>
       </AnimatePresence>
    </div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const cartLines = useCart(s => s.lines);
  const subtotal = useCart(selectCartSubtotal);
  const clearCart = useCart(s => s.clear);
  
  const addresses = useAddressStore(s => s.addresses);
  const defaultAddress = useAddressStore(s => s.defaultAddress);
  const setIsPickerOpen = useAddressStore(s => s.setIsPickerOpen);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const profile = useProfileStore(s => s.profile);
  const fetchProfile = useProfileStore(s => s.fetchProfile);
  const [checkoutPhone, setCheckoutPhone] = useState("");

  useEffect(() => {
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress.id);
    } else if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0].id);
    }
  }, [defaultAddress, addresses, selectedAddress]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(DELIVERY_OPTIONS[0].id);
  const [selectedPayment, setSelectedPayment] = useState<string | null>("card");
  
  // Card Details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  
  // Order Notes
  const [orderNotes, setOrderNotes] = useState("");

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Pricing math
  const deliveryOpt = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery);
  const deliveryCharge = subtotal >= 500 ? 0 : (deliveryOpt ? deliveryOpt.price : 0);
  const platformFee = 4; // Rs 4 platform fee
  const gst = subtotal * 0.05; // 5% GST
  const discount = couponApplied ? (subtotal * 0.15) : 0; // 15% off
  const grandTotal = Math.max(0, subtotal + deliveryCharge + gst + platformFee - discount);

  // Form Validity
  const needsPhone = !profile?.phone || profile.phone.trim() === "";
  const isPhoneValid = !needsPhone || checkoutPhone.trim().length >= 10;
  const isFormValid = selectedAddress !== null && selectedDelivery !== null && selectedPayment !== null && isPhoneValid;

  // Format Card Number (XXXX XXXX XXXX XXXX)
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    val = val.replace(/(.{4})/g, "$1 ").trim();
    if(val.length <= 19) setCardNumber(val);
  };
  
  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if(val.length > 2) val = val.substring(0,2) + "/" + val.substring(2,4);
    if(val.length <= 5) setCardExpiry(val);
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid) return;
    setIsPlacingOrder(true);
    
    try {
      // Save phone if needed
      if (needsPhone && checkoutPhone.trim().length >= 10) {
        await ProfileService.updateProfile({ phone: checkoutPhone });
        await fetchProfile();
      }

      const addressObj = addresses.find(a => a.id === selectedAddress) || defaultAddress;

      const payload = {
        p_customer_id: profile?.id || null,
        p_customer_name: profile?.fullName || "Guest",
        p_customer_phone: profile?.phone || checkoutPhone,
        p_delivery_address: addressObj,
        p_payment_method: selectedPayment,
        p_notes: orderNotes || null,
        p_coupon_code: couponApplied ? couponCode : null,
        p_items: cartLines.map(line => ({
          product_id: line.product.id,
          quantity: line.qty
        }))
      };

      await OrderService.placeOrder(payload);

      setIsPlacingOrder(false);
      setOrderSuccess(true);
      
      // Fire Confetti!
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      
      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) { return clearInterval(interval); }
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);

    } catch (error: any) {
      console.error(error);
      setIsPlacingOrder(false);
      alert("Failed to place order: " + error.message);
    }
  };

  if (cartLines.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2C2C2E]">Your cart is empty</h2>
          <Link to="/products" className="mt-4 inline-block bg-slate-900 text-white px-6 py-3 rounded-full font-bold hover:bg-slate-800 transition-colors">Go Shopping</Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white p-10 rounded-[32px] max-w-md w-full text-center shadow-2xl border border-slate-100 relative z-10"
        >
           <motion.div 
             initial={{ scale: 0 }} 
             animate={{ scale: 1 }}
             transition={{ type: "spring", delay: 0.2, stiffness: 300, damping: 20 }}
             className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] mb-6 text-white"
           >
             <Check className="size-10" strokeWidth={3} />
           </motion.div>
           <h1 className="text-3xl font-bold text-[#2C2C2E] tracking-tight">Order Placed!</h1>
           <p className="text-slate-500 mt-2 font-medium">Order #HIM-{Math.floor(100000 + Math.random() * 900000)}</p>
           
           <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
               <Zap className="size-6 text-amber-500 fill-amber-500" />
             </div>
             <div className="text-left">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Arrival</p>
               <p className="text-lg font-bold text-[#2C2C2E]">{deliveryOpt?.time || "Soon"}</p>
             </div>
           </div>

           <div className="mt-8 flex flex-col gap-3">
             <Link to="/tracking" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold shadow-lg hover:bg-emerald-500 hover:shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-95">
               Track Order Live
             </Link>
             <button onClick={() => { clearCart(); navigate({ to: "/" }); }} className="w-full bg-white text-slate-600 border border-slate-200 rounded-2xl py-4 font-bold hover:bg-slate-50 transition-all active:scale-95">
               Continue Shopping
             </button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] pb-32 md:pb-12 text-[#2C2C2E]">
      
      {/* Checkout Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={() => goBack("/cart")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#2C2C2E] transition-colors">
            <ArrowLeft className="size-4" /> Back to Cart
          </button>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-12 flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Checkout Form */}
        <div className="flex-1 min-w-0 pb-10 flex flex-col gap-8">
          
          {/* 1. ADDRESS */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-900 text-white">1</div>
                Delivery Address
              </h2>
            </div>
            
            {/* Visual Map Preview */}
            <div className="w-full h-32 rounded-2xl bg-slate-100 overflow-hidden relative mb-4">
                <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" alt="Map" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-[#2C2C2E] shadow-sm">
                  <Navigation className="size-3 text-emerald-600" /> Current Location
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => {
                const isSelected = selectedAddress === addr.id;
                const Icon = addr.type === 'Home' ? Home : addr.type === 'Work' ? Building2 : MapPin;
                return (
                  <motion.button
                    key={addr.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)]' : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                            <Icon className="size-4" />
                          </div>
                          <h3 className={`font-bold ${isSelected ? 'text-emerald-900' : 'text-[#2C2C2E]'}`}>{addr.type}</h3>
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-wider font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Default</span>
                          )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'border-emerald-500' : 'border-slate-200'}`}>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium pl-[44px] leading-relaxed">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state}, {addr.pinCode}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider pl-[44px] mt-2">{addr.phone}</p>
                  </motion.button>
                );
              })}
            </div>
            <button 
              onClick={() => setIsPickerOpen(true)}
              className="mt-4 flex items-center justify-center w-full gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#2C2C2E] hover:border-slate-400 hover:bg-slate-50 transition-colors font-bold text-sm"
            >
              <Plus className="size-4" /> Add New Address
            </button>
          </div>
          
          {/* 2. DELIVERY */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-900 text-white">2</div>
                Delivery Slot
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DELIVERY_OPTIONS.map((opt) => {
                const isSelected = selectedDelivery === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDelivery(opt.id)}
                    className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)]' : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`block p-2 rounded-xl shadow-sm border w-max ${isSelected ? 'bg-white border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>{opt.icon}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-emerald-500' : 'border-slate-200'}`}>
                        <AnimatePresence>
                          {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                        </AnimatePresence>
                      </div>
                    </div>
                    <h3 className={`font-bold text-sm ${isSelected ? 'text-emerald-900' : 'text-[#2C2C2E]'}`}>{opt.name}</h3>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">{opt.time}</p>
                    <div className="mt-3 text-sm font-bold text-[#2C2C2E] flex items-center justify-between">
                      {opt.price === 0 || subtotal >= 500 ? (
                        <span className="text-emerald-500">Free</span>
                      ) : (
                        `+₹${opt.price}`
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
            
            {subtotal < 500 && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl text-amber-700 text-xs font-bold border border-amber-200/50 flex items-center gap-2">
                <Zap className="size-4" /> Add {formatCurrency(500 - subtotal)} more to unlock Free Delivery
              </div>
            )}
          </div>

          {/* 3. PAYMENT */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-900 text-white">3</div>
                Payment Method
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPayment === method.id;
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`relative text-left h-full flex flex-col p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-emerald-500 bg-emerald-50/50 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.3)]' : 'border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm'}`}
                  >
                    {/* Tag */}
                    {method.tag && (
                      <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                        {method.tag}
                      </span>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                        <Icon className="size-5" />
                      </div>
                      
                      {/* Radio Button */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-emerald-500' : 'border-slate-200'}`}>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    
                    <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-emerald-900' : 'text-[#2C2C2E]'}`}>{method.name}</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">{method.desc}</p>
                  </motion.button>
                );
              })}
            </div>
            
            {/* VIRTUAL CREDIT CARD UI */}
            <AnimatePresence mode="wait">
              {selectedPayment === "card" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row items-center gap-8 overflow-hidden"
                >
                  {/* Card Preview */}
                  <div className="w-full max-w-[320px] shrink-0 aspect-[1.586] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-2xl shadow-xl p-6 flex flex-col justify-between text-white overflow-hidden relative">
                     <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                     <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl" />
                     
                     <div className="flex justify-between items-start z-10">
                       <CreditCard className="size-8 opacity-80" />
                       <span className="font-bold italic tracking-tighter text-lg opacity-90">VISA</span>
                     </div>
                     <div className="z-10 mt-auto">
                       <div className="text-xl tracking-[0.15em] font-mono mb-3 min-h-[28px] text-emerald-50">
                         {cardNumber || "•••• •••• •••• ••••"}
                       </div>
                       <div className="flex justify-between items-center opacity-80">
                         <div className="flex flex-col">
                           <span className="text-[8px] uppercase tracking-widest font-bold">Cardholder</span>
                           <span className="text-xs tracking-widest font-mono font-bold mt-0.5">JANE DOE</span>
                         </div>
                         <div className="flex flex-col items-end">
                           <span className="text-[8px] uppercase tracking-widest font-bold">Expires</span>
                           <span className="text-xs tracking-widest font-mono font-bold mt-0.5">{cardExpiry || "MM/YY"}</span>
                         </div>
                       </div>
                     </div>
                  </div>
                  
                  {/* Inputs */}
                  <div className="w-full flex flex-col gap-4">
                     <div>
                       <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Card Number</label>
                       <input 
                         type="text" 
                         placeholder="0000 0000 0000 0000" 
                         value={cardNumber}
                         onChange={handleCardNumber}
                         className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-mono"
                       />
                     </div>
                     <div className="flex gap-4">
                       <div className="w-1/2">
                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">Expiry</label>
                         <input 
                           type="text" 
                           placeholder="MM/YY" 
                           value={cardExpiry}
                           onChange={handleExpiry}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-mono"
                         />
                       </div>
                       <div className="w-1/2">
                         <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">CVV</label>
                         <input 
                           type="password" 
                           placeholder="•••" 
                           maxLength={3}
                           value={cardCvc}
                           onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                           className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow font-mono"
                         />
                       </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. ORDER NOTES */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-slate-900 text-white"><FileText className="size-4" /></div>
                Order Notes (Optional)
              </h2>
            </div>
            
            <div>
              <textarea 
                rows={3}
                placeholder="Delivery instructions (e.g. Leave at the door, Don't ring doorbell)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-shadow resize-none placeholder:text-slate-400 text-slate-700"
              />
            </div>
          </div>
          
          {/* 5. CONTACT DETAILS (If Missing) */}
          {needsPhone && (
            <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-rose-100 text-rose-600 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full">Required</span>
              </div>
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-rose-500 text-white"><Smartphone className="size-4" /></div>
                  Contact Details
                </h2>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-4">We need a mobile number to coordinate your delivery and send tracking updates.</p>
              <div>
                <input 
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-rose-300 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-rose-50 outline-none transition-all placeholder:text-slate-400 text-[#2C2C2E]"
                />
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="w-full lg:w-[420px] shrink-0">
          <div className="sticky top-24 bg-white rounded-[32px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden flex flex-col">
            
            <div className="p-6 md:p-8 pb-0">
              <h2 className="text-xl font-bold text-[#2C2C2E] mb-6 flex items-center gap-2">
                <Receipt className="size-5 text-slate-400" /> Order Summary
              </h2>

              {/* Coupons Auto-Suggest */}
              <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
                  {SUGGESTED_COUPONS.map(c => (
                    <button 
                      key={c.code}
                      onClick={() => setCouponCode(c.code)}
                      className="shrink-0 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 flex flex-col items-start hover:bg-emerald-100 transition-colors text-left"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">{c.code}</span>
                      <span className="text-[10px] font-bold text-emerald-600/80">{c.desc}</span>
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Enter promo code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={couponApplied}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-24 py-3.5 text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                  />
                  <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <button 
                    onClick={() => setCouponApplied(true)}
                    disabled={!couponCode || couponApplied}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {couponApplied ? <Check className="size-4" /> : "Apply"}
                  </button>
                </div>
              </div>

              <div className="w-full h-[1px] bg-slate-100 mb-6" />
              
              {/* Calculations */}
              <div className="flex flex-col gap-4 text-sm font-medium text-slate-500 mb-6">
                 <div className="flex justify-between items-center">
                   <span>Subtotal</span>
                   <AnimatedPrice value={subtotal} bold={false} className="text-[#2C2C2E]" />
                 </div>
                 
                 <AnimatePresence mode="popLayout">
                   {discount > 0 && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }} 
                       animate={{ opacity: 1, height: 'auto' }} 
                       exit={{ opacity: 0, height: 0 }}
                       className="flex justify-between items-center text-emerald-500"
                     >
                       <span className="flex items-center gap-1"><Tag className="size-3" /> Coupon discount</span>
                       <span className="font-bold">-{formatCurrency(discount)}</span>
                     </motion.div>
                   )}
                 </AnimatePresence>
                 
                 <div className="flex justify-between items-center">
                   <span>Delivery Charge</span>
                   {deliveryCharge === 0 ? (
                     <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest bg-emerald-50 px-2 py-0.5 rounded-sm">Free</span>
                   ) : (
                     <AnimatedPrice value={deliveryCharge} bold={false} className="text-[#2C2C2E]" />
                   )}
                 </div>
                 
                 <div className="flex justify-between items-center">
                   <span>Platform Fee</span>
                   <AnimatedPrice value={platformFee} bold={false} className="text-[#2C2C2E]" />
                 </div>

                 <div className="flex justify-between items-center">
                   <span>GST (5%)</span>
                   <AnimatedPrice value={gst} bold={false} className="text-[#2C2C2E]" />
                 </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 md:p-8 mt-auto border-t border-slate-100">
              <div className="flex justify-between items-end mb-6">
                 <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Grand Total</span>
                 <AnimatedPrice value={grandTotal} className="text-3xl text-[#2C2C2E] tracking-tighter" />
              </div>

              {/* Desktop Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !isFormValid}
                className="hidden lg:flex w-full h-14 bg-slate-900 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg items-center justify-center gap-2 shadow-[0_10px_20px_-10px_rgba(15,23,42,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all duration-300 overflow-hidden relative group disabled:opacity-50 disabled:pointer-events-none"
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-10" />
                
                <AnimatePresence mode="wait">
                  {isPlacingOrder ? (
                    <motion.div 
                      key="loader"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center gap-2 z-20"
                    >
                      <Loader2 className="size-5 animate-spin" /> Processing...
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="text"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="flex flex-col items-center justify-center leading-tight z-20"
                    >
                      <span className="text-base">Place Order</span>
                      {deliveryOpt && <span className="text-[10px] text-white/80 uppercase tracking-widest font-semibold">{deliveryOpt.time}</span>}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Loader Progress Bar */}
                {isPlacingOrder && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1 bg-white/30 z-20"
                  />
                )}
              </button>
              
              {!isFormValid && (
                <p className="hidden lg:block text-[10px] text-rose-500 font-bold uppercase tracking-wider text-center mt-3">
                  {needsPhone && !isPhoneValid ? "Please provide a valid mobile number" : "Please select address, delivery slot, and payment method"}
                </p>
              )}

              <div className="mt-4 hidden lg:flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
                <ShieldCheck className="size-3.5" /> 256-bit Secure Payment
              </div>
            </div>
            
          </div>
        </div>

      </div>

      {/* Floating Place Order Button for Mobile/Tablet */}
      <AnimatePresence>
        {!orderSuccess && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 lg:hidden z-50 flex flex-col gap-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="flex justify-between items-center mb-1">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-[#2C2C2E]">{formatCurrency(grandTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Delivery</p>
                <p className="text-xs font-bold text-emerald-600">{deliveryOpt?.time || "Select slot"}</p>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || !isFormValid}
              className="w-full h-14 bg-slate-900 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all overflow-hidden relative group disabled:opacity-50 disabled:pointer-events-none"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
              {isPlacingOrder ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <>Place Order</>
              )}
            </button>
            {!isFormValid && (
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider text-center">
                {needsPhone && !isPhoneValid ? "Mobile number required" : "Missing selections"}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

