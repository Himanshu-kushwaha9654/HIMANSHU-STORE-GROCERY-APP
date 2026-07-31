import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import { Link } from "@tanstack/react-router";

const RECENT_ORDERS = [
  { id: "#ORD-4923", customer: "Sarah Jenkins", products: 4, amount: 2450, payment: "Paid", status: "Processing", date: "Just now" },
  { id: "#ORD-4922", customer: "Michael Chen", products: 12, amount: 8900, payment: "Paid", status: "Delivered", date: "1 hour ago" },
  { id: "#ORD-4921", customer: "Emma Wilson", products: 2, amount: 450, payment: "Failed", status: "Cancelled", date: "2 hours ago" },
  { id: "#ORD-4920", customer: "David Kumar", products: 7, amount: 4200, payment: "Paid", status: "Shipped", date: "3 hours ago" },
  { id: "#ORD-4919", customer: "Lisa Ray", products: 5, amount: 1850, payment: "Pending", status: "Processing", date: "5 hours ago" },
];

export function RecentOrdersTable() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex-1 h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Recent Orders</h3>
        <Link to="/admin/orders" className="text-sm font-bold text-emerald-600 hover:text-emerald-700">View All</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-sm font-bold text-slate-400">
              <th className="pb-3 pl-2">Order</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Payment</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm font-semibold">
            {RECENT_ORDERS.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                <td className="py-4 pl-2 text-slate-800">{order.id}</td>
                <td className="py-4 text-slate-600">
                  <div className="text-slate-800">{order.customer}</div>
                  <div className="text-xs font-medium text-slate-400">{order.products} items • {order.date}</div>
                </td>
                <td className="py-4 text-slate-800">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(order.amount)}
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    order.payment === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                    order.payment === 'Failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.payment}
                  </span>
                </td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    order.status === 'Delivered' ? 'bg-blue-50 text-blue-600' :
                    order.status === 'Shipped' ? 'bg-indigo-50 text-indigo-600' :
                    order.status === 'Cancelled' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Eye className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
