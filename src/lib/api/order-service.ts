import { supabase } from '@/integrations/supabase/client';
import { Order, OrderReview, OrderStatus } from '../order-store';
import { useProfileStore } from '../profile-store';

export class OrderService {
  /**
   * Fetches all orders for the current user.
   */
  static async getOrders(): Promise<Order[]> {
    const user = useProfileStore.getState().profile;
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('customer_phone', user.phone)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }

    return (data || []).map(this.mapOrder);
  }

  /**
   * Fetches a single order by ID.
   */
  static async getOrderById(id: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error("Error fetching order by ID:", error);
      return undefined;
    }

    return this.mapOrder(data);
  }

  /**
   * Submits a rating and review for an order.
   */
  static async rateOrder(id: string, review: OrderReview): Promise<void> {
    // In a real app we would have a reviews table
    console.warn("Reviews are not yet stored in Supabase.");
  }

  /**
   * Cancels an order (if allowed).
   */
  static async cancelOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .update({ order_status: 'cancelled' })
      .eq('id', id);
      
    if (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }

  /**
   * Place a new order using the advanced place_order RPC.
   */
  static async placeOrder(payload: {
    p_customer_id: string | null;
    p_customer_name: string;
    p_customer_phone: string;
    p_delivery_address: any;
    p_payment_method: string;
    p_notes: string | null;
    p_coupon_code: string | null;
    p_items: { product_id: string; quantity: number }[];
  }): Promise<string> {
    const { data, error } = await supabase.rpc('place_order', payload);
    
    if (error) {
      console.error("Error placing order:", error);
      throw new Error(error.message || "Failed to place order.");
    }
    
    return data;
  }

  static async reorder(id: string): Promise<void> {
    // Handled by UI cart store right now
  }

  private static mapOrder(dbOrder: any): Order {
    let uiStatus: OrderStatus = 'Order Placed';
    switch(dbOrder.order_status) {
      case 'pending': uiStatus = 'Order Placed'; break;
      case 'accepted': uiStatus = 'Payment Confirmed'; break;
      case 'packing': uiStatus = 'Preparing Order'; break;
      case 'packed': uiStatus = 'Packed'; break;
      case 'out_for_delivery': uiStatus = 'Out for Delivery'; break;
      case 'delivered': uiStatus = 'Delivered'; break;
      case 'cancelled': uiStatus = 'Cancelled'; break;
    }

    let uiPaymentStatus: any = 'Pending';
    switch(dbOrder.payment_status) {
      case 'pending': uiPaymentStatus = 'Pending'; break;
      case 'success': uiPaymentStatus = 'Success'; break;
      case 'failed': uiPaymentStatus = 'Failed'; break;
      case 'refund': uiPaymentStatus = 'Refunded'; break;
    }

    return {
      id: dbOrder.id,
      displayId: dbOrder.invoice_number,
      date: dbOrder.created_at,
      status: uiStatus,
      items: (dbOrder.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        price: Number(item.unit_price),
        qty: item.quantity,
        img: "" // We could fetch image here if needed
      })),
      priceBreakdown: {
        subtotal: Number(dbOrder.subtotal),
        discount: Number(dbOrder.discount),
        deliveryCharge: Number(dbOrder.delivery_charge),
        platformFee: 0, // Not stored explicitly? Default 0
        couponDiscount: 0,
        rewardPointsUsed: 0,
        gst: Number(dbOrder.gst),
        total: Number(dbOrder.total_amount),
      },
      paymentMethod: dbOrder.payment_method.toUpperCase(),
      paymentStatus: uiPaymentStatus,
      address: {
        name: dbOrder.delivery_address?.name || dbOrder.customer_name,
        phone: dbOrder.delivery_address?.phone || dbOrder.customer_phone,
        street: dbOrder.delivery_address?.street || '',
        city: dbOrder.delivery_address?.city || '',
        state: dbOrder.delivery_address?.state || '',
        pincode: dbOrder.delivery_address?.pinCode || ''
      },
      estimatedDelivery: dbOrder.expected_delivery,
    };
  }
}
