import { motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export function WelcomeSection() {
  const { user } = useAuth();
  
  // Get first name or default
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "Himanshu";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            Good Morning, {firstName} 👋
          </h2>
        </div>
        <p className="text-slate-500 font-medium text-sm">
          Here's what's happening with your store today, {format(new Date(), "MMMM do, yyyy")}.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center">
          <span className="text-sm font-bold text-slate-700">System Healthy</span>
        </div>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm font-bold text-sm transition-colors">
          Download Report
        </button>
      </div>
    </motion.div>
  );
}
