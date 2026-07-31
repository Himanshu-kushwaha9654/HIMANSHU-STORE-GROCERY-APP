import { MapPin, Bell, User, Search, Mic, ScanLine, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAddressStore } from "@/lib/address-store";
import { useNotificationStore } from "@/lib/notification-store";
import { motion } from "framer-motion";

export function MobileHeader() {
  const { defaultAddress, setIsPickerOpen } = useAddressStore();
  const unreadCount = useNotificationStore(s => s.notifications.filter(n => !n.isRead).length);

  return (
    <div className="sticky top-0 z-50 w-full bg-white sm:hidden shadow-sm border-b border-slate-100">
      <div className="flex flex-col px-4 pt-3 pb-3 gap-3">
        
        {/* Top Row: Location, Notifications, Profile */}
        <div className="flex items-center justify-between">
          
          {/* Location Picker */}
          <div 
            className="flex flex-col flex-1 min-w-0 pr-4 cursor-pointer"
            onClick={() => setIsPickerOpen(true)}
          >
            <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm">
              <MapPin className="w-4 h-4 fill-emerald-100" />
              <span className="truncate">Delivery in 10 mins</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
            </div>
            <div className="text-xs text-slate-500 font-medium truncate mt-0.5 max-w-[220px]">
              {defaultAddress ? `${defaultAddress.line1}` : "Select your location"}
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3 shrink-0">
            <Link 
              to="/notifications"
              className="relative p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </Link>
            <Link 
              to="/profile"
              className="p-1 border-2 border-emerald-100 rounded-full bg-slate-50 overflow-hidden"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Second Row: Search Bar */}
        <div className="relative flex items-center gap-2">
          <div className="flex-1 flex items-center bg-slate-100/80 rounded-xl px-3 py-2.5 border border-slate-200/50 hover:bg-slate-100 transition-colors cursor-text" onClick={() => {
                const evt = new CustomEvent("open-search");
                window.dispatchEvent(evt);
              }}>
            <Search className="w-4 h-4 text-emerald-600 shrink-0" />
            <input 
              type="text" 
              placeholder='Search "Fresh Milk"' 
              className="w-full bg-transparent border-none text-sm font-medium outline-none px-2 placeholder:text-slate-400 text-slate-700 cursor-text pointer-events-none"
              readOnly
            />
            <div className="w-px h-4 bg-slate-300 mx-1"></div>
            <button className="text-emerald-600 p-1 hover:bg-emerald-50 rounded-full transition-colors shrink-0 cursor-pointer pointer-events-auto">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          
          <button className="w-[42px] h-[42px] shrink-0 flex items-center justify-center bg-slate-100/80 rounded-xl border border-slate-200/50 text-slate-700 hover:bg-slate-100 hover:text-emerald-600 transition-colors">
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}
