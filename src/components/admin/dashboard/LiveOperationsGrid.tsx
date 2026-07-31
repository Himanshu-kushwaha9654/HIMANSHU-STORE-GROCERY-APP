import { motion, AnimatePresence } from "framer-motion";
import { Users, ShoppingCart, PackageSearch, Truck, PackageCheck, CircleDot, TrendingUp, TrendingDown, Star, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const generateMetrics = () => [
  { id: 'visitors', label: "Live Visitors", value: 248, trend: 12.5, icon: <Users className="size-4" />, color: "text-blue-400", bg: "bg-blue-50", border: "border-blue-100", info: "Active in last 5 mins" },
  { id: 'carts', label: "Active Carts", value: 84, trend: 5.2, icon: <ShoppingCart className="size-4" />, color: "text-purple-400", bg: "bg-purple-50", border: "border-purple-100", info: "Value: ₹42,500" },
  { id: 'processing', label: "Processing", value: 32, trend: -2.1, icon: <PackageSearch className="size-4" />, color: "text-amber-400", bg: "bg-amber-50", border: "border-amber-100", info: "Avg time: 14m" },
  { id: 'delivery', label: "Out for Delivery", value: 18, trend: 8.4, icon: <Truck className="size-4" />, color: "text-indigo-400", bg: "bg-indigo-50", border: "border-indigo-100", info: "12 active riders" },
  { id: 'delivered', label: "Delivered Today", value: 942, trend: 15.3, icon: <PackageCheck className="size-4" />, color: "text-emerald-400", bg: "bg-emerald-50", border: "border-emerald-100", info: "98% on-time" },
  { id: 'rating', label: "Avg Rating", value: 4.8, trend: 0.2, icon: <Star className="size-4" />, color: "text-amber-300", bg: "bg-amber-50", border: "border-amber-100", info: "From 120 reviews" },
];

export function LiveOperationsGrid() {
  const [metrics, setMetrics] = useState(generateMetrics());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => {
        if (m.id === 'visitors' || m.id === 'carts') {
          const fluctuation = Math.floor(Math.random() * 5) - 2;
          return { ...m, value: Math.max(0, m.value + fluctuation) };
        }
        return m;
      }));
      setLastUpdated(new Date());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white border border-slate-100 p-6 rounded-[20px] shadow-sm relative overflow-hidden h-full flex flex-col"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20"></span>
            <CircleDot className="size-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Live Operations
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                Online
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="size-3 text-slate-400" />
              <p className="text-[11px] font-medium text-slate-500">
                Last updated: <span className="text-slate-700">
                  {lastUpdated ? format(lastUpdated, "hh:mm:ss a") : "--:--:-- --"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
        {metrics.map((item) => (
          <motion.div 
            key={item.id} 
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-slate-50 border border-slate-100 p-4 rounded-[16px] relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <div className={`size-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-white ${item.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {Math.abs(item.trend)}%
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{item.label}</span>
              <div className="text-2xl font-black tracking-tight text-slate-800 flex items-baseline gap-1">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={item.value}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.id === 'rating' ? item.value.toFixed(1) : item.value}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 h-1 bg-white w-full">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, Math.max(10, (item.value / (item.id === 'delivered' ? 1000 : 300)) * 100))}%` }}
                transition={{ duration: 1 }}
                className={`h-full ${item.bg.replace('50', '200')}`}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
