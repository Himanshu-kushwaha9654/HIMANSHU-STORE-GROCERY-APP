import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrderWithDetails, AdminOrderService, OrderStatus } from "@/lib/services/admin/admin-order-service";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, MapPin, Package, Phone, Truck, X, DollarSign, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";

const OrderMap = lazy(() => import('./OrderMap'));

interface OrderDetailsDrawerProps {
  order: OrderWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export function OrderDetailsDrawer({ order, isOpen, onClose, onStatusUpdated }: OrderDetailsDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const updateStatus = async (newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      await AdminOrderService.updateOrderStatus(order.id, newStatus, "Admin");
      toast.success(`Order marked as ${newStatus}`);
      onStatusUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const statusFlow: { status: OrderStatus; label: string; icon: any }[] = [
    { status: 'pending', label: 'Pending', icon: Clock },
    { status: 'accepted', label: 'Accepted', icon: CheckCircle2 },
    { status: 'packing', label: 'Packing', icon: Package },
    { status: 'packed', label: 'Packed', icon: Package },
    { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStatusIndex = statusFlow.findIndex(s => s.status === order.order_status);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-slate-50 p-0 border-l border-slate-200 shadow-2xl">
        <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
          <SheetHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold text-slate-800">
                Order #{order.invoice_number}
              </SheetTitle>
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                {order.order_status.replace(/_/g, ' ')}
              </div>
            </div>
            <p suppressHydrationWarning className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Clock className="size-4" />
              {format(new Date(order.created_at), 'PPP at p')}
            </p>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Circle className="size-4 text-emerald-500 fill-emerald-500" /> Customer
              </h3>
              <div>
                <p className="font-bold text-slate-700">{order.customer_name}</p>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2 mt-1">
                  <Phone className="size-3.5" /> {order.customer_phone}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="size-4 text-blue-500 fill-blue-500" /> Delivery
              </h3>
              <div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  {order.delivery_address?.street || 'No street provided'}
                  <br />
                  {order.delivery_address?.city}, {order.delivery_address?.state} {order.delivery_address?.zip}
                </p>
              </div>
            </div>
          </div>

          {/* Map Integration */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-64 relative z-0">
            {(order.delivery_address?.lat && order.delivery_address?.lng) ? (
              <Suspense fallback={<div className="flex h-full items-center justify-center bg-slate-50 text-slate-500 font-medium text-sm">Loading map...</div>}>
                {typeof window !== 'undefined' && (
                  <OrderMap 
                    lat={order.delivery_address.lat} 
                    lng={order.delivery_address.lng} 
                    street={order.delivery_address.street} 
                  />
                )}
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-center p-4">
                <MapPin className="size-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-500">No Coordinates Provided</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">This order's address does not contain precise GPS coordinates for mapping.</p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {order.order_status === 'pending' && (
                <>
                  <Button onClick={() => updateStatus('accepted')} disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Accept Order</Button>
                  <Button onClick={() => updateStatus('cancelled')} disabled={isUpdating} variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl">Reject</Button>
                </>
              )}
              {order.order_status === 'accepted' && (
                <Button onClick={() => updateStatus('packing')} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">Start Packing</Button>
              )}
              {order.order_status === 'packing' && (
                <Button onClick={() => updateStatus('packed')} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Mark as Packed</Button>
              )}
              {order.order_status === 'packed' && (
                <Button onClick={() => updateStatus('out_for_delivery')} disabled={isUpdating} className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl">Out for Delivery</Button>
              )}
              {order.order_status === 'out_for_delivery' && (
                <Button onClick={() => updateStatus('delivered')} disabled={isUpdating} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">Confirm Delivery</Button>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Package className="size-4" /> Products ({order.items.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{item.product_name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      {item.quantity} x ₹{item.unit_price}
                    </p>
                  </div>
                  <div className="font-bold text-slate-800">
                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>Delivery Charge</span>
                <span>₹{order.delivery_charge}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm font-bold text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-800">
                <span>Total Amount</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${order.payment_status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                <DollarSign className="size-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm uppercase">{order.payment_method}</p>
                <p className="text-xs font-medium text-slate-500 capitalize">{order.payment_status}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold gap-2">
              <Receipt className="size-4" /> Invoice
            </Button>
          </div>

          {/* Timeline Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="size-4" /> Order Timeline
            </h3>
            <div className="space-y-4">
              {order.logs.map((log, index) => (
                <div key={log.id} className="flex gap-4 relative">
                  {index !== order.logs.length - 1 && (
                    <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200 -z-10"></div>
                  )}
                  <div className="size-4 rounded-full bg-slate-100 border-2 border-slate-300 mt-1 z-10 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 capitalize">
                      Marked as {log.status_to.replace(/_/g, ' ')}
                    </p>
                    <p suppressHydrationWarning className="text-xs font-medium text-slate-500 mt-0.5">
                      {format(new Date(log.created_at), 'MMM d, h:mm a')} • By {log.changed_by}
                    </p>
                    {log.notes && (
                      <p className="text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg mt-2 border border-slate-100">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {order.logs.length === 0 && (
                <p className="text-sm text-slate-500 font-medium">No timeline events yet.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
