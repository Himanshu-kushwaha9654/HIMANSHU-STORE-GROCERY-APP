import { motion } from "framer-motion";
import { Activity, Database, CreditCard, Mail, MessageSquare, Sparkles, MapPin } from "lucide-react";

const SERVICES = [
  { name: "Database", icon: <Database className="size-4" />, status: "green", uptime: "99.99%" },
  { name: "Core API", icon: <Activity className="size-4" />, status: "green", uptime: "99.99%" },
  { name: "Payment Gateway", icon: <CreditCard className="size-4" />, status: "green", uptime: "100%" },
  { name: "Email Service", icon: <Mail className="size-4" />, status: "green", uptime: "99.9%" },
  { name: "SMS Service", icon: <MessageSquare className="size-4" />, status: "yellow", uptime: "98.5%" },
  { name: "AI Engine", icon: <Sparkles className="size-4" />, status: "green", uptime: "100%" },
  { name: "Location Service", icon: <MapPin className="size-4" />, status: "red", uptime: "89.2%" },
];

export function SystemHealth() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="size-5 text-slate-400" />
          System Health
        </h3>
        <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded-md">
          1 Degraded
        </span>
      </div>

      <div className="space-y-3">
        {SERVICES.map((service, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-slate-400">
                {service.icon}
              </div>
              <span className="text-sm font-bold text-slate-700">{service.name}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-400 w-12 text-right">{service.uptime}</span>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                service.status === 'green' ? 'bg-emerald-50 text-emerald-600' :
                service.status === 'yellow' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                <span className={`size-1.5 rounded-full ${
                  service.status === 'green' ? 'bg-emerald-500' :
                  service.status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                {service.status === 'green' ? 'Operational' :
                 service.status === 'yellow' ? 'Degraded' : 'Offline'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
