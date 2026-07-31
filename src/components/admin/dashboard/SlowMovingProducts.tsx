import { motion } from "framer-motion";
import { Tag, Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

const SLOW_PRODUCTS = [
  { id: 1, name: "Premium Olive Oil 1L", daysSinceSale: 14, stock: 45, discount: "15%", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop" },
  { id: 2, name: "Organic Quinoa 500g", daysSinceSale: 11, stock: 120, discount: "20%", image: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=100&h=100&fit=crop" },
  { id: 3, name: "Dark Chocolate 85%", daysSinceSale: 8, stock: 65, discount: "10%", image: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=100&h=100&fit=crop" },
];

export function SlowMovingProducts() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <Clock className="size-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Slow Moving Products</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Needs attention</p>
          </div>
        </div>
        <Link to="/admin/analytics" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Detailed Report</Link>
      </div>

      <div className="space-y-4">
        {SLOW_PRODUCTS.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover bg-slate-100" />
              <div>
                <div className="text-sm font-bold text-slate-800">{item.name}</div>
                <div className="text-xs font-medium mt-0.5 text-rose-500 font-bold">
                  {item.daysSinceSale} days since last sale
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Current Stock: <span className="text-slate-600">{item.stock} units</span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors border border-indigo-100">
              <Tag className="size-3.5" />
              Suggest {item.discount} Off
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
