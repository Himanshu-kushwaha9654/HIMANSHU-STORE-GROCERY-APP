import { motion, AnimatePresence } from "framer-motion";
import { Users, ShoppingCart, PackageSearch, Truck, PackageCheck, CircleDot, TrendingUp, TrendingDown, Star, Sparkles, Clock, Activity, CreditCard, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

// Mock Data Generators
const generateMetrics = () => [
  { id: 'visitors', label: "Live Visitors", value: 248, trend: 12.5, icon: <Users className="size-4" />, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", info: "Active in last 5 mins" },
  { id: 'carts', label: "Active Carts", value: 84, trend: 5.2, icon: <ShoppingCart className="size-4" />, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", info: "Value: ₹42,500" },
  { id: 'processing', label: "Processing", value: 32, trend: -2.1, icon: <PackageSearch className="size-4" />, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", info: "Avg time: 14m" },
  { id: 'delivery', label: "Out for Delivery", value: 18, trend: 8.4, icon: <Truck className="size-4" />, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", info: "12 active riders" },
  { id: 'delivered', label: "Delivered Today", value: 942, trend: 15.3, icon: <PackageCheck className="size-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", info: "98% on-time" },
  { id: 'rating', label: "Avg Rating", value: 4.8, trend: 0.2, icon: <Star className="size-4" />, color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/20", info: "From 120 reviews" },
];

const INITIAL_ACTIVITIES = [
  { id: 1, type: 'order', text: "New order #1042 received", time: "Just now", icon: <ShoppingCart className="size-3" />, color: "text-emerald-400" },
  { id: 2, type: 'payment', text: "Payment of ₹1,450 confirmed", time: "2 mins ago", icon: <CreditCard className="size-3" />, color: "text-blue-400" },
  { id: 3, type: 'delivery', text: "Order #1038 delivered", time: "5 mins ago", icon: <PackageCheck className="size-3" />, color: "text-indigo-400" },
  { id: 4, type: 'abandoned', text: "Cart abandoned (₹850)", time: "12 mins ago", icon: <Activity className="size-3" />, color: "text-rose-400" },
  { id: 5, type: 'customer', text: "New customer registered", time: "15 mins ago", icon: <UserPlus className="size-3" />, color: "text-purple-400" },
];

export function LiveStoreStatus() {
  const [metrics, setMetrics] = useState(generateMetrics());
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Simulate real-time data updates
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-20"></span>
            <CircleDot className="size-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
              Live Operations
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                Online
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="size-3 text-slate-400" />
              <p className="text-xs font-medium text-slate-500">
                Last updated: <span className="text-slate-700">{format(lastUpdated, "hh:mm:ss a")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column: 2x3 Metric Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full">
            {metrics.map((item) => (
              <motion.div 
                key={item.id} 
                whileHover={{ y: -2, scale: 1.01 }}
                className={`bg-white border border-slate-100 shadow-sm p-4 rounded-[16px] relative overflow-hidden group`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`size-8 rounded-lg flex items-center justify-center ${item.bg} ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className={`flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-50 ${item.trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.trend > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(item.trend)}%
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</span>
                  <div className="text-3xl font-black tracking-tight text-slate-800 flex items-baseline gap-1">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={item.value}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.id === 'rating' ? item.value.toFixed(1) : item.value}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-slate-500 font-medium mt-2">{item.info}</span>
                </div>

                {/* Decorative progress bar at bottom */}
                <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.max(10, (item.value / (item.id === 'delivered' ? 1000 : 300)) * 100))}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full ${item.bg.replace('/10', '/50')}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Insights & Activity Feed */}
        <div className="flex flex-col gap-6">
          
          {/* AI Insights Card */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-[16px] p-5 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.03]">
              <Sparkles className="size-24 text-indigo-900" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles className="size-4 text-indigo-600" />
              <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider">AI Insight</h4>
            </div>
            <p className="text-sm text-indigo-950 font-medium leading-relaxed relative z-10">
              Visitor traffic is <span className="text-emerald-600 font-bold">12% higher</span> than usual for this time. Consider enabling the "Flash Sale" banner to convert active carts.
            </p>
            <button className="mt-4 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors relative z-10 shadow-sm">
              Enable Flash Sale
            </button>
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-[16px] p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Live Feed</h4>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">LIVE</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {activities.map((activity, idx) => (
                <motion.div 
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-3"
                >
                  <div className={`mt-0.5 size-6 shrink-0 rounded-full bg-slate-50 flex items-center justify-center ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 leading-tight">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
