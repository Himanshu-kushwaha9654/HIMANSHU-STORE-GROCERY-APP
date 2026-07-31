import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, CreditCard, ShieldCheck, CheckCircle2, Wallet, Smartphone, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentService, PaymentMethod } from "@/lib/services/payment-service";
import { toast } from "sonner";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";

export const Route = createFileRoute("/_authenticated/payments")({
  head: () => ({ meta: [{ title: "Payment Center — Himanshu Store" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const goBack = useNavigateBack();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMethods();
  }, []);

  async function loadMethods() {
    setLoading(true);
    try {
      const data = await PaymentService.getSavedMethods();
      setMethods(data);
    } catch (err) {
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await PaymentService.deleteMethod(id);
      toast.success("Payment method removed");
      loadMethods();
    } catch (err) {
      toast.error("Failed to remove method");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await PaymentService.setDefault(id);
      toast.success("Default payment updated");
      loadMethods();
    } catch (err) {
      toast.error("Update failed");
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "UPI": return <Smartphone className="size-5" />;
      case "Wallet": return <Wallet className="size-5" />;
      case "Card": return <CreditCard className="size-5" />;
      default: return <Banknote className="size-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-purple-100 selection:text-purple-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 text-slate-700">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-bold text-[#1C1C1E] tracking-tight text-[17px]">Payment Center</h1>
        <div className="size-10" />
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 mt-4">
        
        {/* Safe & Secure Banner */}
        <div className="bg-purple-50 border border-purple-100 rounded-[24px] p-5 mb-8 flex items-start gap-4 shadow-sm">
          <div className="size-10 bg-white rounded-full flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 mb-1 text-sm">100% Safe & Secure Payments</h3>
            <p className="text-purple-700/80 text-xs font-medium leading-relaxed">
              We use 256-bit encryption. Your payment details are tokenized and safely stored as per RBI guidelines.
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white border-2 border-dashed border-slate-200 text-purple-600 rounded-[24px] p-5 flex items-center justify-center gap-2 font-bold mb-8 hover:bg-slate-50 transition-colors shadow-sm"
          onClick={() => toast.info("Add new payment method modal")}
        >
          <Plus className="size-5" /> Add New Payment Method
        </motion.button>

        <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 tracking-tight">Saved Methods</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {methods.map((method) => (
                <motion.div
                  key={method.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`bg-white p-5 rounded-[24px] border shadow-sm transition-all relative overflow-hidden group ${method.isDefault ? 'border-purple-200 shadow-purple-500/5' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  {method.isDefault && (
                    <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> DEFAULT
                    </div>
                  )}

                  <div className="flex gap-4 items-center">
                    <div className={`size-12 rounded-[16px] flex items-center justify-center shrink-0 border ${method.isDefault ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-slate-50 border-slate-100 text-slate-500 group-hover:bg-slate-100 transition-colors'}`}>
                      {getIcon(method.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-8">
                      <h3 className="font-bold text-[#1C1C1E] text-sm md:text-base">{method.provider}</h3>
                      <p className="text-slate-500 text-xs md:text-sm font-medium mt-0.5 font-mono">{method.details}</p>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-1/2 -translate-y-1/2">
                      <button 
                        onClick={() => handleDelete(method.id)}
                        className="text-red-500 text-[10px] uppercase font-bold hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(method.id)}
                          className="text-purple-600 text-[10px] uppercase font-bold hover:bg-purple-50 px-2 py-1 rounded-md transition-colors"
                        >
                          Make Default
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
