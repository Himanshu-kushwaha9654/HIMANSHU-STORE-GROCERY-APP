import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, CalendarClock, CreditCard, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

const ALERTS = [
  {
    id: 1,
    title: "Low Stock Products",
    description: "4 items are below minimum stock levels",
    icon: <AlertTriangle className="size-5" />,
    color: "rose",
    action: "Restock Now",
    path: "/admin/inventory",
    priority: "high"
  },
  {
    id: 2,
    title: "Delayed Deliveries",
    description: "2 orders are running late",
    icon: <Clock className="size-5" />,
    color: "amber",
    action: "View Orders",
    path: "/admin/orders",
    priority: "high"
  },
  {
    id: 3,
    title: "Failed Payments",
    description: "3 recent payments failed",
    icon: <CreditCard className="size-5" />,
    color: "rose",
    action: "Review",
    path: "/admin/orders",
    priority: "medium"
  },
  {
    id: 4,
    title: "Expiring Coupons",
    description: "SUMMER50 expires today",
    icon: <CalendarClock className="size-5" />,
    color: "blue",
    action: "Manage",
    path: "/admin/coupons",
    priority: "low"
  }
];

export function SmartBusinessAlerts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {ALERTS.map((alert, idx) => {
        const bgColors = {
          rose: "bg-rose-50 border-rose-100",
          amber: "bg-amber-50 border-amber-100",
          blue: "bg-blue-50 border-blue-100",
        };
        const textColors = {
          rose: "text-rose-600",
          amber: "text-amber-600",
          blue: "text-blue-600",
        };
        const iconBg = {
          rose: "bg-rose-100/50",
          amber: "bg-amber-100/50",
          blue: "bg-blue-100/50",
        };

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5, type: "spring" }}
            className={`rounded-2xl border p-4 flex flex-col justify-between group transition-colors ${bgColors[alert.color as keyof typeof bgColors]}`}
          >
            <div className="flex items-start gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg[alert.color as keyof typeof iconBg]} ${textColors[alert.color as keyof typeof textColors]}`}>
                {alert.icon}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${textColors[alert.color as keyof typeof textColors]}`}>
                  {alert.title}
                </h4>
                <p className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-2">
                  {alert.description}
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Link
                to={alert.path}
                className={`flex items-center gap-1 text-xs font-bold hover:underline ${textColors[alert.color as keyof typeof textColors]}`}
              >
                {alert.action}
                <ChevronRight className="size-3" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
