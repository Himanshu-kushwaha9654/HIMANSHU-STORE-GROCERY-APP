import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TOP_PRODUCTS = [
  { id: 1, name: "Premium Hass Avocados", sold: 1245, revenue: 185000, trend: 12.5, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop" },
  { id: 2, name: "Organic Bananas", sold: 980, revenue: 45000, trend: 8.2, image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=100&h=100&fit=crop" },
  { id: 3, name: "Free Range Eggs (Dozen)", sold: 850, revenue: 76500, trend: -2.4, image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100&h=100&fit=crop" },
  { id: 4, name: "Fresh Milk 1L", sold: 720, revenue: 54000, trend: 5.1, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop" },
  { id: 5, name: "Whole Wheat Bread", sold: 610, revenue: 30500, trend: 1.5, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&h=100&fit=crop" },
];

export function TopSellingProducts() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Top Selling Products</h3>
        <Link to="/admin/analytics" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Detailed Report</Link>
      </div>

      <div className="space-y-4">
        {TOP_PRODUCTS.map((item, idx) => {
          const isPositive = item.trend >= 0;
          return (
            <div key={item.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-slate-400 w-4 text-center">{idx + 1}</div>
                <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover bg-slate-100" />
                <div>
                  <div className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{item.name}</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{item.sold.toLocaleString()} units sold</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-bold text-slate-800">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.revenue)}
                </div>
                <div className={`flex items-center justify-end gap-1 text-xs font-bold mt-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {Math.abs(item.trend)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
