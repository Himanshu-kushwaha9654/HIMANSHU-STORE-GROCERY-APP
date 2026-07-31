import { motion } from "framer-motion";
import { Plus, Image as ImageIcon, Ticket, FolderPlus, FileText, PackageSearch, ChefHat, Truck } from "lucide-react";
import { Link } from "@tanstack/react-router";

const ACTIONS = [
  { title: "Add Product", icon: <Plus className="size-5" />, path: "/admin/products/new", color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  { title: "Manage Inventory", icon: <PackageSearch className="size-5" />, path: "/admin/inventory", color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { title: "Add Supplier", icon: <Truck className="size-5" />, path: "/admin/inventory", color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  { title: "Create Coupon", icon: <Ticket className="size-5" />, path: "/admin/coupons", color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { title: "Upload Banner", icon: <ImageIcon className="size-5" />, path: "/admin/banners", color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { title: "Add Category", icon: <FolderPlus className="size-5" />, path: "/admin/categories", color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { title: "Create Recipe", icon: <ChefHat className="size-5" />, path: "/admin/recipes", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
  { title: "Sales Report", icon: <FileText className="size-5" />, path: "/admin/reports", color: "bg-slate-100 text-slate-600 hover:bg-slate-200" },
];

export function QuickActions() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 h-full"
    >
      <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {ACTIONS.map((action, idx) => (
          <Link 
            key={idx}
            to={action.path}
            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-center ${action.color}`}
          >
            {action.icon}
            <span className="text-xs font-bold leading-tight">{action.title}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
