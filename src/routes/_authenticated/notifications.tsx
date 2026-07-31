import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { 
  ArrowLeft, Bell, Package, Sparkles, Tag, ShieldAlert, Trash2, Check, BellRing, User, Archive, Zap, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { useNotificationStore, NotificationCategory } from "@/lib/notification-store";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Himanshu Store" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const goBack = useNavigateBack();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, archive } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState<"ALL" | NotificationCategory>("ALL");

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "ALL") return notifications;
    return notifications.filter(n => n.category === activeFilter);
  }, [notifications, activeFilter]);

  // Grouping logic
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof notifications> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Older: []
    };

    filteredNotifications.forEach(notif => {
      const date = new Date(notif.createdAt);
      if (isToday(date)) groups.Today.push(notif);
      else if (isYesterday(date)) groups.Yesterday.push(notif);
      else if (isThisWeek(date)) groups["This Week"].push(notif);
      else groups.Older.push(notif);
    });

    return groups;
  }, [filteredNotifications]);

  const getIconInfo = (category: string) => {
    switch (category) {
      case "ORDERS": 
      case "DELIVERY": return { icon: <Package className="size-5" />, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" };
      case "OFFERS": 
      case "COUPONS": return { icon: <Tag className="size-5" />, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" };
      case "REWARDS": return { icon: <Sparkles className="size-5" />, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-200" };
      case "SECURITY": return { icon: <ShieldAlert className="size-5" />, color: "text-red-600", bg: "bg-red-100", border: "border-red-200" };
      case "ACCOUNT": return { icon: <User className="size-5" />, color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
      case "WISHLIST": return { icon: <Heart className="size-5" />, color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-200" };
      case "AI_RECS": return { icon: <Zap className="size-5" />, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200" };
      default: return { icon: <Bell className="size-5" />, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
    }
  };

  const FILTERS: { label: string; value: "ALL" | NotificationCategory }[] = [
    { label: "All", value: "ALL" },
    { label: "Orders", value: "ORDERS" },
    { label: "Offers", value: "OFFERS" },
    { label: "Rewards", value: "REWARDS" },
    { label: "Coupons", value: "COUPONS" },
    { label: "Wishlist", value: "WISHLIST" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 text-slate-700">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-bold text-[#2C2C2E] tracking-tight text-lg">Notifications</h1>
            {unreadCount > 0 && <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">{unreadCount} Unread</span>}
          </div>
          <div className="size-10 flex items-center justify-center">
            <Bell className="size-5 text-slate-300" />
          </div>
        </div>

        {/* SMART FILTERS */}
        {notifications.length > 0 && (
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-xs transition-all border ${
                  activeFilter === f.value 
                    ? 'bg-[#2C2C2E] text-white border-[#2C2C2E] shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6 mt-2">
        
        {notifications.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#2C2C2E] tracking-tight">Recent Updates</h2>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors active:scale-95">
                  <Check className="size-3.5" /> Mark all read
                </button>
              )}
              <button onClick={clearAll} className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors active:scale-95">
                <Trash2 className="size-3.5" /> Clear
              </button>
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 px-4"
          >
            <motion.div 
              initial={{ y: 15 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-blue-500/5 blur-[40px] rounded-full size-32 mx-auto" />
              <img 
                src="/images/empty_notifications.png" 
                alt="Empty Notifications" 
                className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
              />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C2C2E] tracking-tight mb-3">You're all caught up.</h2>
            <p className="text-slate-500 font-medium mb-8 text-base md:text-lg max-w-sm">
              {activeFilter !== "ALL" ? "No notifications match this filter." : "We'll let you know when there's something new."}
            </p>
            {activeFilter === "ALL" && (
              <button 
                onClick={() => navigate({ to: "/" })}
                className="bg-[#2C2C2E] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-black/10 active:scale-95 transition-all text-base"
              >
                Continue Shopping
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotifications).map(([groupName, notifs]) => {
              if (notifs.length === 0) return null;
              
              return (
                <div key={groupName} className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">{groupName}</h3>
                  <AnimatePresence mode="popLayout">
                    {notifs.map((notif) => {
                      const info = getIconInfo(notif.category);
                      return (
                        <motion.div
                          layout
                          key={notif.id}
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className={`bg-white p-4 sm:p-5 rounded-[24px] border shadow-sm flex gap-4 relative overflow-hidden group cursor-pointer transition-all hover:shadow-md ${
                            notif.isRead ? 'border-slate-100' : `border-transparent shadow-[0_0_0_2px_rgba(16,185,129,0.2)]`
                          }`}
                          onClick={() => { 
                            if (!notif.isRead) markAsRead(notif.id); 
                            if (notif.actionUrl) navigate({ to: notif.actionUrl }); 
                          }}
                        >
                          {!notif.isRead && (
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-1/3 bg-emerald-500 rounded-r-full" />
                          )}
                          
                          <div className={`size-12 sm:size-14 rounded-2xl flex items-center justify-center shrink-0 ${info.bg} ${info.color} border ${info.border}`}>
                            {info.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-10">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                              <h4 className={`text-sm md:text-base tracking-tight truncate ${notif.isRead ? 'font-semibold text-slate-700' : 'font-bold text-[#2C2C2E]'}`}>{notif.title}</h4>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">{formatDistanceToNow(new Date(notif.createdAt))} ago</span>
                            </div>
                            <p className={`text-xs sm:text-sm leading-relaxed ${notif.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                              {notif.message}
                            </p>
                          </div>
      
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => { e.stopPropagation(); archive(notif.id); }}
                              className="size-8 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition-all shadow-sm border border-slate-200"
                            >
                              <Archive className="size-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                              className="size-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 active:scale-95 transition-all shadow-sm border border-red-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
