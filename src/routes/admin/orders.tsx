import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState, useCallback, useRef } from 'react';
import { AdminOrderService, Order, OrderStatus, PaymentMethod, OrderWithDetails } from '@/lib/services/admin/admin-order-service';
import { OrdersTable } from '@/components/admin/orders/OrdersTable';
import { OrderDetailsDrawer } from '@/components/admin/orders/OrderDetailsDrawer';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';
import {
  Package, ShoppingBag, Clock, CheckCircle2, TrendingUp, Search, Calendar,
  Filter, XCircle, BellRing
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  
  // Drawer state
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audio for notifications
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // In a real browser environment, this creates an audio object. 
    // We use a short standard chime if available or rely on system.
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, statsRes] = await Promise.all([
        AdminOrderService.getOrders({
          search: debouncedSearch,
          status: statusFilter,
          paymentMethod: paymentFilter,
          dateFilter: dateFilter,
          limit: 50 // pagination placeholder
        }),
        AdminOrderService.getDashboardStats()
      ]);
      setOrders(ordersRes.orders);
      setStats(statsRes);
    } catch (err: any) {
      toast.error('Failed to load orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, paymentFilter, dateFilter]);

  // Initial load & Setup Realtime
  useEffect(() => {
    loadData();

    const subscription = AdminOrderService.subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        toast('New Order Received!', {
          icon: <ShoppingBag className="size-4 text-emerald-500" />,
          description: `Order #${payload.new.invoice_number} has been placed.`
        });
        
        // Play sound
        if (notificationSound.current) {
          notificationSound.current.play().catch(e => console.log('Audio play failed', e));
        }
      }
      
      // Reload data to reflect changes
      loadData();
      
      // Update drawer if open and is the same order
      if (selectedOrder && payload.new.id === selectedOrder.id) {
        handleRowClick(payload.new as Order); // refresh details
      }
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [loadData]); // Note: loadData is stable, but we re-subscribe if filters change heavily, though typically realtime should update list optimally.

  const handleRowClick = async (order: Order) => {
    try {
      const details = await AdminOrderService.getOrderDetails(order.id);
      setSelectedOrder(details);
      setIsDrawerOpen(true);
    } catch (err: any) {
      toast.error('Failed to load order details');
    }
  };

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen -mt-6 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            Order Management <span className="flex size-3 bg-emerald-500 rounded-full relative"><span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75"></span></span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Live tracking and processing for all customer orders.</p>
        </div>
      </div>

      {/* Top Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><ShoppingBag className="size-3" /> Today</p>
            <p className="text-2xl font-black text-slate-800">{stats.todayOrders}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="size-3" /> Pending</p>
            <p className="text-2xl font-black text-amber-800">{stats.pendingOrders}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 shadow-sm flex flex-col justify-between">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Package className="size-3" /> Processing</p>
            <p className="text-2xl font-black text-indigo-800">{stats.accepted + stats.packing + stats.packed}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 className="size-3" /> Delivered</p>
            <p className="text-2xl font-black text-emerald-800">{stats.delivered}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col justify-between">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><XCircle className="size-3" /> Cancelled</p>
            <p className="text-2xl font-black text-rose-800">{stats.cancelled}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col justify-between">
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><TrendingUp className="size-3" /> Revenue Today</p>
            <p className="text-xl font-black text-blue-800">₹{stats.todayRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-10 sticky top-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by ID, Phone, Name, Invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <XCircle className="size-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <select 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="packing">Packing</option>
              <option value="packed">Packed</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All Payments</option>
              <option value="cod">COD</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <OrdersTable 
          orders={orders} 
          loading={loading} 
          onRowClick={handleRowClick}
        />
      </div>

      <OrderDetailsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        order={selectedOrder}
        onStatusUpdated={loadData}
      />
    </div>
  );
}
