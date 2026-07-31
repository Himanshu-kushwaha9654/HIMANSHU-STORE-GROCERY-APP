import { motion } from "framer-motion";
import { Truck, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const METRICS = [
  { label: "Avg Delivery Time", value: "32 mins", icon: <Clock className="size-5 text-blue-500" /> },
  { label: "On-Time Delivery", value: "98.5%", icon: <CheckCircle2 className="size-5 text-emerald-500" /> },
  { label: "Late Deliveries", value: "4", icon: <AlertCircle className="size-5 text-amber-500" /> },
  { label: "Cancelled", value: "1", icon: <AlertCircle className="size-5 text-rose-500" /> },
];

export function DeliveryPerformance() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.85, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Truck className="size-5 text-slate-400" />
          Delivery Performance
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {METRICS.map((metric, idx) => (
          <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              {metric.icon}
              <span className="text-xl font-black text-slate-800">{metric.value}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{metric.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
