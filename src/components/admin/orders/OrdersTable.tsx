import { Order, OrderStatus } from "@/lib/services/admin/admin-order-service";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrdersTableProps {
  orders: Order[];
  onRowClick: (order: Order) => void;
  loading: boolean;
}

export function OrdersTable({ orders, onRowClick, loading }: OrdersTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-96 flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col items-center justify-center p-8 text-center">
        {/* Empty state illustration placeholder */}
        <div className="size-24 bg-slate-50 rounded-full mb-4 flex items-center justify-center">
          <svg className="size-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-700">No Orders Yet</h3>
        <p className="text-slate-500 mt-2 max-w-sm mx-auto">When customers place orders, they will appear here in real time.</p>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 ring-amber-200';
      case 'accepted': return 'bg-blue-100 text-blue-700 ring-blue-200';
      case 'packing': return 'bg-indigo-100 text-indigo-700 ring-indigo-200';
      case 'packed': return 'bg-purple-100 text-purple-700 ring-purple-200';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-700 ring-orange-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 ring-rose-200';
      default: return 'bg-slate-100 text-slate-700 ring-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {orders.map((order) => (
          <div 
            key={order.id} 
            onClick={() => onRowClick(order)}
            className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800">#{order.invoice_number}</p>
                <p className="text-xs font-medium text-slate-500 font-mono mt-0.5">{order.id.substring(0, 8)}...</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ring-1 ring-inset ${getStatusColor(order.order_status)}`}>
                {order.order_status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-700 text-sm">{order.customer_name}</p>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="size-3" /> {order.customer_phone}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-800 text-lg">₹{order.total_amount}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {order.payment_method}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    order.payment_status === 'success' ? 'text-emerald-700 bg-emerald-100' : 
                    order.payment_status === 'pending' ? 'text-amber-700 bg-amber-100' : 'text-rose-700 bg-rose-100'
                  }`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
              <div>
                <p className="text-[11px] font-medium text-slate-700">{format(new Date(order.created_at), 'MMM d, h:mm a')}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">Expected: {order.expected_delivery ? format(new Date(order.expected_delivery), 'h:mm a') : 'N/A'}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Order Details</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount & Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4">Timing</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => onRowClick(order)}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <td className="p-4">
                  <p className="font-bold text-slate-800">#{order.invoice_number}</p>
                  <p className="text-xs font-medium text-slate-500 font-mono mt-0.5">{order.id.substring(0, 8)}...</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-slate-700">{order.customer_name}</p>
                  <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="size-3" /> {order.customer_phone}
                  </p>
                </td>
                <td className="p-4">
                  <p className="font-black text-slate-800">₹{order.total_amount}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {order.payment_method}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      order.payment_status === 'success' ? 'text-emerald-700 bg-emerald-100' : 
                      order.payment_status === 'pending' ? 'text-amber-700 bg-amber-100' : 'text-rose-700 bg-rose-100'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ring-1 ring-inset ${getStatusColor(order.order_status)}`}>
                    {order.order_status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4">
                  <p className="text-sm font-medium text-slate-700">{format(new Date(order.created_at), 'MMM d, h:mm a')}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Expected: {order.expected_delivery ? format(new Date(order.expected_delivery), 'h:mm a') : 'N/A'}</p>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 rounded-xl transition-colors">
                    <ChevronRight className="size-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
