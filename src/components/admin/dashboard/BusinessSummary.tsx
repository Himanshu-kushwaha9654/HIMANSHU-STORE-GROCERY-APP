import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

interface Metric {
  label: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  trend?: number; // positive or negative percentage
}

const SUMMARY_METRICS: Metric[] = [
  { label: "Today's Revenue", value: 124500, isCurrency: true, trend: 14.5 },
  { label: "Today's Expenses", value: 42000, isCurrency: true, trend: -2.4 },
  { label: "Gross Profit", value: 82500, isCurrency: true, trend: 8.2 },
  { label: "Net Profit Margin", value: 24.5, isPercentage: true, trend: 1.5 },
  { label: "Total Orders", value: 845, trend: 12.0 },
  { label: "Average Order Value", value: 850, isCurrency: true, trend: 4.1 },
  { label: "Cancelled Orders", value: 12, trend: -15.0 }, // negative trend on cancellations is good
  { label: "Total Refunds", value: 4500, isCurrency: true, trend: 2.4 },
  { label: "Repeat Customers", value: 68, isPercentage: true, trend: 5.2 },
];

function AnimatedValue({ value, isCurrency, isPercentage }: { value: number, isCurrency?: boolean, isPercentage?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; 
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(easeProgress * (value - startValue) + startValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value]);

  if (isCurrency) {
    return <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.floor(count))}</span>;
  }
  if (isPercentage) {
    return <span>{count.toFixed(1)}%</span>;
  }
  return <span>{Math.floor(count).toLocaleString('en-IN')}</span>;
}

export function BusinessSummary() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Today's Business Summary</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Comprehensive overview of today's performance</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            <TrendingUp className="size-3" /> +14.5% vs Yesterday
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-8 gap-x-4">
        {SUMMARY_METRICS.map((metric, idx) => {
          // Special logic: negative trend on cancellations/refunds/expenses might be "good" (emerald).
          // For simplicity, we'll assume higher revenue/profit is green, lower expenses/cancellations is green.
          const isNegativeMetric = ["Cancelled Orders", "Total Refunds", "Today's Expenses"].includes(metric.label);
          const isFavorable = isNegativeMetric ? (metric.trend! <= 0) : (metric.trend! >= 0);
          
          return (
            <div key={idx} className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 mb-1">{metric.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  <AnimatedValue value={metric.value} isCurrency={metric.isCurrency} isPercentage={metric.isPercentage} />
                </span>
              </div>
              {metric.trend !== undefined && (
                <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${isFavorable ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {metric.trend > 0 ? <TrendingUp className="size-3" /> : metric.trend < 0 ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                  {Math.abs(metric.trend)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
