import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, ShoppingBag, FolderTree, Package, 
  ShoppingCart, Users, Ticket, Gift, Image as ImageIcon, 
  ChefHat, BarChart3, Bell, Settings, LogOut, ChevronLeft, ChevronRight, FileText, Store
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/lib/services/auth-service";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: ShoppingBag },
  { name: "Categories", path: "/admin/categories", icon: FolderTree },
  { name: "Inventory", path: "/admin/inventory", icon: Package },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", path: "/admin/customers", icon: Users },
  { name: "Coupons", path: "/admin/coupons", icon: Ticket },
  { name: "Rewards", path: "/admin/rewards", icon: Gift },
  { name: "Banner Manager", path: "/admin/banners", icon: ImageIcon },
  { name: "Recipes", path: "/admin/recipes", icon: ChefHat },
  { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  { name: "Reports", path: "/admin/reports", icon: FileText },
  { name: "Notifications", path: "/admin/notifications", icon: Bell },
  { name: "Settings", path: "/admin/settings", icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function AdminSidebar({ mobileOpen, setMobileOpen }: AdminSidebarProps = {}) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await AuthService.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <motion.aside 
        initial={false}
        animate={{ 
          width: isCollapsed ? 80 : 260,
          x: mobileOpen ? 0 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-[#1C1C1E] border-r border-[#2C2C2E] flex flex-col shrink-0 relative z-40 h-screen text-slate-300 font-sans shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0 fixed left-0 top-0 bottom-0" : "-translate-x-full lg:translate-x-0 absolute lg:relative"
        }`}
      >
      <div className="h-16 flex items-center px-6 border-b border-[#2C2C2E] shrink-0 justify-between">
        <AnimatePresence mode="popLayout">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col whitespace-nowrap"
            >
              <h1 className="text-[16px] font-black tracking-tight text-white uppercase leading-none">
                HIMANSHU STORE
              </h1>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase mt-0.5">
                Business Console
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg">
              H
            </div>
          </div>
        )}
      </div>
      
      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-[#2C2C2E] text-slate-300 p-1.5 rounded-full border border-[#3C3C3E] hover:bg-[#3C3C3E] transition-colors z-50 shadow-md"
      >
        {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
      </button>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;
          
          return (
            <div key={item.name} className="relative group">
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-all relative overflow-hidden group/link ${
                  isActive 
                    ? "text-white bg-white/10" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab" 
                    className="absolute inset-0 bg-white/5 border-l-4 border-emerald-500" 
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
                  <Icon className={`size-5 transition-colors ${isActive ? "text-emerald-400" : "group-hover/link:text-emerald-400/70"}`} />
                </div>
                
                <AnimatePresence mode="popLayout">
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-[#2C2C2E] text-white text-xs font-bold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-white/5">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#2C2C2E] shrink-0 space-y-2">
        <button 
          onClick={() => window.location.href = "/"}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors group relative overflow-hidden"
        >
           <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
            <Store className="size-5 transition-transform group-hover:scale-110" />
           </div>
           
           <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Exit Admin
              </motion.span>
            )}
           </AnimatePresence>
        </button>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-400/10 transition-colors group relative overflow-hidden"
        >
           <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? "w-full" : ""}`}>
            <LogOut className="size-5 transition-transform group-hover:-translate-x-1" />
           </div>
           
           <AnimatePresence mode="popLayout">
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
           </AnimatePresence>
        </button>
      </div>
    </motion.aside>
    </>
  );
}
