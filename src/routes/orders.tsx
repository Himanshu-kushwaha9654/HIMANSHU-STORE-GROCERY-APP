import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { OrderService } from "@/lib/api/order-service";
import { Order } from "@/lib/order-store";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Search, ChevronRight, CheckCircle2, Clock, Truck, XCircle, ChevronLeft } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [{ title: "My Orders — Himanshu Store" }],
  }),
  component: OrdersPage,
});

const TABS = ["All", "In Progress", "Delivered", "Cancelled"] as const;

function getStatusColor(status: string) {
  switch (status) {
    case 'Delivered': return 'text-emerald-600 bg-emerald-50 ring-emerald-100';
    case 'Cancelled': 
    case 'Refunded': return 'text-rose-600 bg-rose-50 ring-rose-100';
    case 'Out for Delivery': 
    case 'Arriving Soon': return 'text-amber-600 bg-amber-50 ring-amber-100';
    case 'Packed': 
    case 'Delivery Partner Assigned': return 'text-blue-600 bg-blue-50 ring-blue-100';
    case 'Order Placed': return 'text-slate-600 bg-slate-50 ring-slate-100';
    case 'Payment Confirmed': return 'text-indigo-600 bg-indigo-50 ring-indigo-100';
    case 'Preparing Order': return 'text-violet-600 bg-violet-50 ring-violet-100';
    default: return 'text-slate-600 bg-slate-50 ring-slate-100';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Delivered': return <CheckCircle2 className="size-4" />;
    case 'Cancelled': 
    case 'Refunded': return <XCircle className="size-4" />;
    case 'Out for Delivery': 
    case 'Arriving Soon':
    case 'Delivery Partner Assigned': return <Truck className="size-4" />;
    case 'Packed': return <Package className="size-4" />;
    default: return <Clock className="size-4" />;
  }
}

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = () => {
    OrderService.getOrders().then(data => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase.channel('public:orders:all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Filter by tab
    if (activeTab === "Delivered") result = result.filter(o => o.status === 'Delivered');
    if (activeTab === "Cancelled") result = result.filter(o => o.status === 'Cancelled');
    if (activeTab === "In Progress") result = result.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
    
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.displayId.toLowerCase().includes(q) || 
        o.items.some(item => item.name.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="min-h-[100dvh] bg-[#FAFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors shrink-0">
              <ChevronLeft className="size-5 text-slate-700" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-[#2C2C2E] tracking-tight">My Orders</h1>
          </div>
        </div>
        
        {/* Search & Tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-4 flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Product Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100/80 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl transition-all text-sm font-medium text-[#2C2C2E] placeholder:text-slate-500 outline-none"
            />
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab 
                    ? 'bg-[#2C2C2E] text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 py-6">
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-20 px-4"
          >
            <motion.div 
              initial={{ y: 20 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full size-32 mx-auto" />
              <img 
                src="file:///c:/Users/Himanshu%20Kushwaha/.gemini/antigravity-ide/brain/3af2a57c-4a06-4bca-8312-e24293ce2190/empty_orders_box_1784110389328.png" 
                alt="Empty Box" 
                className="w-48 h-48 object-contain relative z-10 drop-shadow-2xl"
              />
            </motion.div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C2C2E] tracking-tight mb-3">No Orders Found</h2>
            <p className="text-slate-500 font-medium mb-8 text-base md:text-lg max-w-sm">
              {searchQuery ? "We couldn't find any orders matching your search. Try adjusting the filters." : "Looks like your order history is empty. Time to stock up on groceries!"}
            </p>
            {!searchQuery && (
              <Link 
                to="/" 
                className="bg-[#2C2C2E] hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-black/10 active:scale-95 transition-all text-base"
              >
                Start Shopping Now
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05, type: "spring", bounce: 0.3 }}
                >
                  <Link 
                    to="/orders/$id" 
                    params={{ id: order.id }}
                    className="block bg-white border border-slate-100 p-5 sm:p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                          {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <h3 className="text-base font-bold text-[#2C2C2E]">{order.displayId}</h3>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Product Thumbnails */}
                      <div className="flex flex-1 items-center gap-2 overflow-hidden">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={item.id} className="relative size-16 shrink-0 rounded-2xl bg-slate-50 border border-slate-100 p-2 overflow-hidden group-hover:border-emerald-100 transition-colors" style={{ zIndex: 10 - idx }}>
                            <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            <div className="absolute -top-1 -right-1 bg-white size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm border border-slate-100">
                              x{item.qty}
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="size-16 shrink-0 rounded-2xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Total & Action */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-500 mb-0.5">{order.items.reduce((a,b)=>a+b.qty, 0)} Items</p>
                        <p className="text-lg font-bold text-[#2C2C2E] mb-2">{formatCurrency(order.priceBreakdown.total)}</p>
                        <div className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                          View Details <ChevronRight className="size-3 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

