import { motion } from "framer-motion";
import { AlertTriangle, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

const LOW_STOCK_ITEMS = [
  { id: 1, name: "Organic Almond Milk", stock: 2, minStock: 10, supplier: "Nature Farms LLC", image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100&h=100&fit=crop" },
  { id: 2, name: "Fresh Strawberries", stock: 0, minStock: 20, supplier: "Valley Fresh Produce", image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=100&h=100&fit=crop" },
  { id: 3, name: "Whole Wheat Bread", stock: 4, minStock: 15, supplier: "Daily Bakehouse", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" },
];

export function LowStockAlert() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex-1 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="size-4" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Low Stock Alert</h3>
        </div>
        <Link to="/admin/inventory" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
      </div>

      <div className="space-y-4">
        {LOW_STOCK_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover bg-slate-100" />
              <div>
                <div className="text-sm font-bold text-slate-800">{item.name}</div>
                <div className="text-xs font-medium mt-0.5">
                  {item.stock === 0 ? (
                     <span className="text-rose-500 font-bold">Out of stock</span>
                  ) : (
                    <span className="text-amber-500 font-bold">{item.stock} left in stock</span>
                  )}
                  <span className="text-slate-400"> (Min: {item.minStock})</span>
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  Supplier: <span className="text-slate-600">{item.supplier}</span>
                </div>
              </div>
            </div>
            
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors">
              <Plus className="size-3.5" />
              Restock
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
