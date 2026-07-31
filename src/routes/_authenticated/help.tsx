import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare, Phone, Mail, FileWarning, Search, ChevronRight, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help & Support — Himanshu Store" }] }),
  component: HelpPage,
});

const FAQS = [
  { q: "How do I track my order?", a: "You can track your order from the 'My Orders' section in your profile." },
  { q: "What is your return policy?", a: "We offer a no-questions-asked return policy within 24 hours of delivery for fresh items." },
  { q: "How are refunds processed?", a: "Refunds are processed immediately to your original payment method and reflect within 3-5 days." },
  { q: "Do you offer premium memberships?", a: "Yes, join our Rewards Hub to upgrade your tier and enjoy free deliveries." }
];

function HelpPage() {
  const goBack = useNavigateBack();
  const [search, setSearch] = useState("");
  
  const filteredFaqs = FAQS.filter(faq => faq.q.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-bold text-[#1C1C1E] tracking-tight text-[17px]">Help & Support</h1>
        <div className="size-10" />
      </header>

      {/* Hero */}
      <div className="bg-[#1C1C1E] pt-8 pb-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
        
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-[0_10px_30px_rgba(99,102,241,0.4)] mb-4">
            <HelpCircle className="size-8" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">How can we help?</h2>
          
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search for articles..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 -mt-6 relative z-20">
        
        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Opening Live Chat...")}
            className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-indigo-200 hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="size-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <MessageSquare className="size-6" />
            </div>
            <span className="font-bold text-[#1C1C1E] text-sm">Live Chat</span>
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Dialing 1800-GROCERY...")}
            className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-emerald-200 hover:shadow-emerald-500/5 transition-all group"
          >
            <div className="size-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Phone className="size-6" />
            </div>
            <span className="font-bold text-[#1C1C1E] text-sm">Call Us</span>
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Opening email client...")}
            className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-blue-200 hover:shadow-blue-500/5 transition-all group"
          >
            <div className="size-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Mail className="size-6" />
            </div>
            <span className="font-bold text-[#1C1C1E] text-sm">Email Us</span>
          </motion.button>

          <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info("Report Issue form opens")}
            className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-orange-200 hover:shadow-orange-500/5 transition-all group"
          >
            <div className="size-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <FileWarning className="size-6" />
            </div>
            <span className="font-bold text-[#1C1C1E] text-sm">Report Issue</span>
          </motion.button>
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 tracking-tight">Frequently Asked Questions</h2>
        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          {filteredFaqs.length > 0 ? filteredFaqs.map((faq, i) => (
            <div key={i} className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group last:border-0" onClick={() => toast.info(faq.a, { duration: 5000 })}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1C1C1E] text-sm group-hover:text-indigo-600 transition-colors pr-4">{faq.q}</h3>
                <ChevronRight className="size-5 text-slate-300 shrink-0" />
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No results found for "{search}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
