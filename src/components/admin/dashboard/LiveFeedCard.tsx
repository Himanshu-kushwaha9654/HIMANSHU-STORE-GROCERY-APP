import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, PackageCheck, Activity, UserPlus } from "lucide-react";
import { useState } from "react";

const INITIAL_ACTIVITIES = [
  { id: 1, type: 'order', text: "New order #1042 received", time: "Just now", icon: <ShoppingCart className="size-3" />, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: 2, type: 'payment', text: "Payment of ₹1,450 confirmed", time: "2 mins ago", icon: <CreditCard className="size-3" />, color: "text-blue-500", bg: "bg-blue-50" },
  { id: 3, type: 'delivery', text: "Order #1038 delivered", time: "5 mins ago", icon: <PackageCheck className="size-3" />, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: 4, type: 'abandoned', text: "Cart abandoned (₹850)", time: "12 mins ago", icon: <Activity className="size-3" />, color: "text-rose-500", bg: "bg-rose-50" },
  { id: 5, type: 'customer', text: "New customer registered", time: "15 mins ago", icon: <UserPlus className="size-3" />, color: "text-purple-500", bg: "bg-purple-50" },
];

export function LiveFeedCard() {
  const [activities] = useState(INITIAL_ACTIVITIES);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-white border border-slate-100 shadow-sm rounded-[20px] p-6 flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-bold text-slate-800 tracking-tight">Live Feed</h4>
        <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 space-y-4">
        {activities.map((activity, idx) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default"
          >
            <div className={`mt-0.5 size-8 shrink-0 rounded-full flex items-center justify-center ${activity.bg} ${activity.color}`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 leading-tight">{activity.text}</p>
              <p className="text-[11px] text-slate-400 font-bold mt-1">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
