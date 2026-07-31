import { supabase } from "@/integrations/supabase/client";
import { DB } from "@/lib/enterprise-data"; // We can use mock products to generate order items

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refund';
export type PaymentMethod = 'cod' | 'upi' | 'card' | 'wallet';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  discount: number;
  created_at: string;
}

export interface OrderLog {
  id: string;
  order_id: string;
  status_from: string | null;
  status_to: string;
  changed_by: string;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  delivery_address: any;
  total_amount: number;
  subtotal: number;
  discount: number;
  gst: number;
  delivery_charge: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  order_status: OrderStatus;
  delivery_partner_id: string | null;
  expected_delivery: string | null;
  delivered_at: string | null;
  delivery_otp: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  logs: OrderLog[];
}

// Mock orders removed for true database connection

export const AdminOrderService = {
  async getOrders(params?: {
    search?: string;
    status?: OrderStatus | 'all';
    paymentMethod?: PaymentMethod | 'all';
    dateFilter?: 'today' | 'yesterday' | 'week' | 'month' | 'all';
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[], count: number }> {
    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (params?.status && params.status !== 'all') {
      query = query.eq('order_status', params.status);
    }
    
    if (params?.paymentMethod && params.paymentMethod !== 'all') {
      query = query.eq('payment_method', params.paymentMethod);
    }

    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(`customer_name.ilike.${searchTerm},customer_phone.ilike.${searchTerm},invoice_number.ilike.${searchTerm},id.eq.${params.search}`);
    }

    if (params?.dateFilter && params.dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      if (params.dateFilter === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (params.dateFilter === 'yesterday') {
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      } else if (params.dateFilter === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (params.dateFilter === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      if (params.dateFilter !== 'all') {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    // Sorting
    query = query.order('created_at', { ascending: false });

    // Pagination
    if (params?.limit) {
      const offset = params.offset || 0;
      query = query.range(offset, offset + params.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("Supabase orders error:", error);
      throw error;
    }
    
    return { 
      orders: data as Order[], 
      count: count || 0 
    };
  },

  async getOrderDetails(orderId: string): Promise<OrderWithDetails> {
    const [orderRes, itemsRes, logsRes] = await Promise.all([
      supabase.from('orders').select('*').eq('id', orderId).single(),
      supabase.from('order_items').select('*').eq('order_id', orderId),
      supabase.from('order_logs').select('*').eq('order_id', orderId).order('created_at', { ascending: true })
    ]);

    if (orderRes.error) {
      console.error("Supabase order details error:", orderRes.error);
      throw orderRes.error;
    }
    
    return {
      ...(orderRes.data as Order),
      items: (itemsRes.data as OrderItem[]) || [],
      logs: (logsRes.data as OrderLog[]) || []
    };
  },

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, adminName: string, notes?: string): Promise<void> {
    // 1. Get current status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('orders')
      .select('order_status')
      .eq('id', orderId)
      .single();
      
    if (fetchError) throw fetchError;
    const oldStatus = currentOrder.order_status;

    // 2. Update status
    const updates: any = { order_status: newStatus };
    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);
      
    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw updateError;
    }

    // 3. Log the change
    await supabase.from('order_logs').insert({
      order_id: orderId,
      status_from: oldStatus,
      status_to: newStatus,
      changed_by: adminName,
      notes: notes || null
    });
  },

  subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  },
  
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // In a real app we'd use an RPC for complex aggregation, but we'll do basic counts here
    const [
      todayOrdersRes,
      pendingRes,
      revenueRes,
      allRes
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
      supabase.from('orders').select('total_amount').gte('created_at', todayStr).not('order_status', 'eq', 'cancelled'),
      supabase.from('orders').select('order_status', { count: 'exact' })
    ]);

    if (todayOrdersRes.error) {
      console.error("Supabase stats error:", todayOrdersRes.error);
      throw todayOrdersRes.error;
    }

    const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;
    
    // Calculate status counts
    const statusCounts = {
      accepted: 0,
      packed: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0
    };
    
    allRes.data?.forEach(order => {
      if (order.order_status in statusCounts) {
        statusCounts[order.order_status as keyof typeof statusCounts]++;
      }
    });

    return {
      todayOrders: todayOrdersRes.count || 0,
      pendingOrders: pendingRes.count || 0,
      todayRevenue: totalRevenue,
      ...statusCounts
    };
  }
};
