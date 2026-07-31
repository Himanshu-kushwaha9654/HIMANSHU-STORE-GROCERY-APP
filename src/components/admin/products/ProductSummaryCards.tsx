import { motion } from "framer-motion";
import { Package, PackageCheck, PackageMinus, PackageX, EyeOff, FileEdit } from "lucide-react";
import { Product } from "@/lib/enterprise-data";

interface ProductSummaryCardsProps {
  products: Product[];
}

export function ProductSummaryCards({ products }: ProductSummaryCardsProps) {
  const total = products.length;
  const active = products.filter(p => p.status === 'active').length;
  const lowStock = products.filter(p => p.stockQty > 0 && p.stockQty <= 10).length;
  const outOfStock = products.filter(p => p.stockQty === 0).length;
  const hidden = products.filter(p => p.visibility === 'hidden').length;
  const draft = products.filter(p => p.status === 'draft').length;

  const CARDS = [
    { label: "Total Products", value: total, icon: <Package className="size-5 text-slate-500" />, bg: "bg-slate-50 border-slate-200" },
    { label: "Active", value: active, icon: <PackageCheck className="size-5 text-emerald-500" />, bg: "bg-emerald-50 border-emerald-100" },
    { label: "Low Stock", value: lowStock, icon: <PackageMinus className="size-5 text-amber-500" />, bg: "bg-amber-50 border-amber-100" },
    { label: "Out of Stock", value: outOfStock, icon: <PackageX className="size-5 text-rose-500" />, bg: "bg-rose-50 border-rose-100" },
    { label: "Hidden", value: hidden, icon: <EyeOff className="size-5 text-indigo-500" />, bg: "bg-indigo-50 border-indigo-100" },
    { label: "Drafts", value: draft, icon: <FileEdit className="size-5 text-purple-500" />, bg: "bg-purple-50 border-purple-100" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {CARDS.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`p-4 rounded-2xl border ${card.bg} flex flex-col items-start gap-3`}
        >
          <div className="size-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            {card.icon}
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
              {card.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
