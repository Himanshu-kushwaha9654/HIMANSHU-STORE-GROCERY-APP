import { motion } from "framer-motion";
import { Award, Star } from "lucide-react";

const TOP_CUSTOMERS = [
  { id: 1, name: "Emily Watson", orders: 42, spend: 125400, lastPurchase: "Today", tier: "Platinum" },
  { id: 2, name: "David Kumar", orders: 38, spend: 98200, lastPurchase: "Yesterday", tier: "Gold" },
  { id: 3, name: "Sarah Jenkins", orders: 35, spend: 85000, lastPurchase: "2 days ago", tier: "Gold" },
  { id: 4, name: "Michael Chen", orders: 29, spend: 72100, lastPurchase: "Last week", tier: "Silver" },
];

export function TopCustomers() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Top Customers</h3>
      </div>

      <div className="space-y-4">
        {TOP_CUSTOMERS.map((customer, idx) => (
          <div key={customer.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-sm font-bold text-slate-400 w-4 text-center">{idx + 1}</div>
              <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                {customer.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  {customer.name}
                  {customer.tier === 'Platinum' && <Award className="size-3.5 text-purple-500" />}
                  {customer.tier === 'Gold' && <Star className="size-3.5 text-amber-500" />}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {customer.orders} orders • Last active {customer.lastPurchase}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(customer.spend)}
              </div>
              <div className={`text-[10px] font-bold mt-0.5 uppercase tracking-wider ${
                customer.tier === 'Platinum' ? 'text-purple-500' :
                customer.tier === 'Gold' ? 'text-amber-500' : 'text-slate-500'
              }`}>
                {customer.tier}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
