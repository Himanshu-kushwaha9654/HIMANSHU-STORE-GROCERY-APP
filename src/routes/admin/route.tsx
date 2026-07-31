import { createFileRoute, Outlet, redirect, useBlocker } from "@tanstack/react-router";
import { AuthService } from "@/lib/services/auth-service";
import { toast } from "sonner";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminGlobalSearch } from "@/components/admin/AdminGlobalSearch";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import "@/admin.css";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // Skip auth check during Server-Side Rendering since we use LocalStorage
    if (typeof localStorage === 'undefined') return;

    const session = AuthService.getSession();
    
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }

    const ADMIN_EMAIL = "himanshukushwahaf352@gmail.com";
    
    if (session.role !== "ADMIN" || session.loginId !== ADMIN_EMAIL) {
      toast.error("Access Denied. You do not have permission to view this page.");
      throw redirect({
        to: "/",
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Block back navigation that attempts to leave the admin panel
  useBlocker({
    shouldBlockFn: ({ next }) => {
      // If the user tries to navigate to a page outside the admin panel via back button or links
      if (!next.pathname.startsWith('/admin')) {
        toast.info("Please use 'Exit Admin' or 'Logout' to leave the console.");
        return true; // Block navigation
      }
      return false; // Allow navigation
    },
  });

  return (
    <div className="admin-theme flex h-screen bg-[#F8F9FA] overflow-hidden">
      
      {/* Premium Sidebar */}
      <AdminSidebar mobileOpen={isMobileSidebarOpen} setMobileOpen={setIsMobileSidebarOpen} />
      
      {/* Overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <AdminTopbar 
          onOpenSearch={() => setIsSearchOpen(true)} 
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 custom-scrollbar">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <AdminGlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
