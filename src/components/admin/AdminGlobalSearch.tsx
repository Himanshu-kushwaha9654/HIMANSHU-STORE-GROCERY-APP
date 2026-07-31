import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, ShoppingCart, Users, FolderTree, Ticket, Package } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AdminGlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminGlobalSearch({ isOpen, onClose }: AdminGlobalSearchProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search logic handled in parent, but this triggers the state via prop
          document.dispatchEvent(new CustomEvent('open-admin-search'));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle routing on select
  const handleSelect = (path: string) => {
    navigate({ to: path });
    onClose();
    setQuery("");
  };

  const MOCK_RESULTS = [
    { id: 1, title: "Go to Products", icon: <ShoppingBag className="size-4" />, type: "Module", path: "/admin/products" },
    { id: 2, title: "Go to Orders", icon: <ShoppingCart className="size-4" />, type: "Module", path: "/admin/orders" },
    { id: 3, title: "Go to Customers", icon: <Users className="size-4" />, type: "Module", path: "/admin/customers" },
    { id: 4, title: "Organic Bananas", icon: <Package className="size-4" />, type: "Product", path: "/admin/products" },
    { id: 5, title: "Order #4892", icon: <ShoppingCart className="size-4" />, type: "Order", path: "/admin/orders" },
  ];

  const filtered = query 
    ? MOCK_RESULTS.filter(r => r.title.toLowerCase().includes(query.toLowerCase()))
    : MOCK_RESULTS.slice(0, 3); // show quick actions when empty

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[101] overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start pt-[10vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                <Search className="size-5 text-emerald-500 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, orders, customers, or jump to..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500">ESC</kbd>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filtered.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {query ? "Results" : "Quick Actions"}
                    </div>
                    {filtered.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="size-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {item.type}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
