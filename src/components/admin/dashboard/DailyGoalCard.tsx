import { motion } from "framer-motion";
import { Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export function DailyGoalCard() {
  const [progress, setProgress] = useState(0);
  const target = 150000;
  const current = 124500;
  const percentage = Math.min(100, Math.floor((current / target) * 100));

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Target className="size-24" />
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Target className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Today's Goal</h3>
          <p className="text-[11px] font-medium text-slate-500">Revenue Target</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="text-3xl font-black tracking-tight text-slate-800 mb-1">
          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(current)}
        </div>
        <p className="text-xs font-bold text-slate-400">
          of {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(target)}
        </p>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2 text-xs font-bold">
          <span className="text-slate-500">Progress</span>
          <span className="text-emerald-600">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg w-max">
        <TrendingUp className="size-3" /> On track to beat target
      </div>
    </motion.div>
  );
}
