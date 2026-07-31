import { Search, Bell, Plus, Menu } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface AdminTopbarProps {
  onOpenSearch: () => void;
  onToggleSidebar?: () => void;
}

export function AdminTopbar({ onOpenSearch, onToggleSidebar }: AdminTopbarProps) {
  const { user } = useAuth();
  const initial = (user?.user_metadata?.full_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      
      {/* Left section: Global Search trigger */}
      <div className="flex-1 flex items-center gap-2">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden size-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
          >
            <Menu className="size-5" />
          </button>
        )}
        <button 
          onClick={onOpenSearch}
          className="flex items-center gap-3 w-full max-w-md px-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl text-slate-500 text-sm font-medium border border-transparent focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none"
        >
          <Search className="size-4" />
          <span>Search everything...</span>
          <div className="ml-auto flex gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white rounded border border-slate-200 shadow-sm text-slate-400">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white rounded border border-slate-200 shadow-sm text-slate-400">K</kbd>
          </div>
        </button>
      </div>

      {/* Right section: Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Status */}
        <div className="hidden lg:flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">
          Store Online
        </div>

        {/* Date */}
        <div className="hidden md:block text-xs font-bold text-slate-400 mr-2">
          {format(new Date(), "MMM dd, yyyy")}
        </div>

        {/* Quick Create */}
        <button className="size-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors relative group">
          <Plus className="size-4.5" />
          <div className="absolute top-full mt-2 right-0 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Quick Create
          </div>
        </button>

        {/* Notifications */}
        <button className="size-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors relative">
          <Bell className="size-4.5" />
          <span className="absolute top-0 right-0 size-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="w-px h-6 bg-slate-200 mx-1"></div>

        {/* Admin Profile Dropdown (Simplified for now) */}
        <button className="flex items-center gap-3 hover:bg-slate-50 p-1 pr-3 rounded-full transition-colors">
          <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
            {initial}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-bold text-slate-700 leading-tight">Admin</div>
            <div className="text-[10px] font-semibold text-slate-400 leading-tight">Super User</div>
          </div>
        </button>
        
      </div>
    </header>
  );
}
