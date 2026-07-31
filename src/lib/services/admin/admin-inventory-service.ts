import { supabase } from "@/integrations/supabase/client";
import { DB, Product, InventoryItem, InventoryLog } from "@/lib/enterprise-data";

// Generate fallback inventory data from mock products
function getFallbackInventory(search?: string, warehouseFilter?: string, statusFilter?: string) {
  // We use DB.products to search ALL products locally
  let mockProducts = DB.products.findMany({ search, limit: search ? 100 : 100 }) as Product[];
  
  let items: InventoryItem[] = mockProducts.map(p => {
    // Deterministic mock generation based on product ID so stats don't jump around crazily
    const charCode = p.id.charCodeAt(0) || 0;
    const warehouseId = charCode % 2 === 0 ? 'wh_1' : 'wh_2';
    
    const currentStock = (charCode * 7) % 150;
    const reservedStock = (charCode * 3) % 5;
    const availableStock = currentStock - reservedStock;
    
    let status: 'healthy' | 'low_stock' | 'out_of_stock' = 'healthy';
    if (availableStock <= 0) status = 'out_of_stock';
    else if (availableStock < 20) status = 'low_stock';

    return {
      id: `inv_${p.id}`,
      productId: p.id,
      productName: p.name,
      productImage: p.images?.[0] || "",
      sku: p.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      barcode: p.barcode || `BC-${Math.floor(Math.random() * 1000000)}`,
      categoryId: p.categoryId,
      brandId: p.brandId,
      supplierId: 'sup_1',
      warehouseId: warehouseId,
      currentStock: currentStock,
      reservedStock: reservedStock,
      availableStock: availableStock,
      buyingPrice: (p.price || 100) * 0.7,
      sellingPrice: p.price || 100,
      inventoryValue: currentStock * ((p.price || 100) * 0.7),
      status: status as any,
    };
  });

  if (warehouseFilter && warehouseFilter !== 'all') {
    items = items.filter(i => i.warehouseId === warehouseFilter);
  }
  
  if (statusFilter && statusFilter !== 'all') {
    items = items.filter(i => i.status === statusFilter);
  }

  return { items, count: items.length };
}

export const AdminInventoryService = {
  async getAllInventory(params?: {
    search?: string;
    warehouseFilter?: string;
    statusFilter?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: InventoryItem[], count: number }> {
    
    // We join the products table (inner join) to be able to search on product name
    let query = supabase
      .from('inventory_items')
      .select('*, products!inner(name, sku, barcode)', { count: 'exact' });

    if (params?.warehouseFilter && params.warehouseFilter !== 'all') {
      query = query.eq('warehouse_id', params.warehouseFilter);
    }
    
    if (params?.statusFilter && params.statusFilter !== 'all') {
      query = query.eq('status', params.statusFilter);
    }

    if (params?.search) {
      const searchTerm = `%${params.search}%`;
      query = query.or(`name.ilike.${searchTerm},sku.ilike.${searchTerm},barcode.ilike.${searchTerm}`, { foreignTable: 'products' });
    }

    // Default sorting
    query = query.order('created_at', { ascending: false });

    // Pagination
    if (params?.limit) {
      const offset = params.offset || 0;
      query = query.range(offset, offset + params.limit - 1);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error("Supabase inventory error (falling back to mock data):", error);
      return getFallbackInventory(params?.search, params?.warehouseFilter, params?.statusFilter);
    }
    
    // Map the nested products data to flat properties so our UI doesn't break
    const mappedItems: InventoryItem[] = (data || []).map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.products?.name,
      productImage: "", // You could join this if needed
      sku: item.products?.sku || "",
      barcode: item.products?.barcode || "",
      categoryId: "", // Add if needed
      warehouseId: item.warehouse_id,
      currentStock: item.current_stock || 0,
      reservedStock: item.reserved_stock || 0,
      availableStock: item.available_stock || 0,
      buyingPrice: item.buying_price || 0,
      sellingPrice: 0,
      inventoryValue: (item.current_stock || 0) * (item.buying_price || 0),
      status: item.status,
    }));

    return { 
      items: mappedItems, 
      count: count || 0 
    };
  },
  
  async getInventoryLogs(): Promise<InventoryLog[]> {
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*, inventory_items(products(name))')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Supabase logs error:", error);
      return [];
    }
    
    return (data || []).map((log: any) => ({
      ...log,
      productName: log.inventory_items?.products?.name
    }));
  },

  async adjustStock(
    inventoryId: string, 
    difference: number, 
    reason: InventoryLog['reason'], 
    adminName: string,
    notes?: string
  ): Promise<void> {
    
    // 1. Get current stock
    const { data: item, error: fetchError } = await supabase
      .from('inventory_items')
      .select('current_stock, reserved_stock, buying_price')
      .eq('id', inventoryId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const prev = item.current_stock;
    const newStock = prev + difference;
    
    if (newStock < 0) throw new Error("Stock cannot be negative");

    const availableStock = newStock - item.reserved_stock;
    let status = 'healthy';
    if (availableStock <= 0) status = 'out_of_stock';
    else if (availableStock < 20) status = 'low_stock';
    
    // 2. Update stock
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newStock,
        status: status
      })
      .eq('id', inventoryId);
      
    if (updateError) throw updateError;

    // 3. Log the transaction
    await supabase.from('inventory_logs').insert({
      inventory_id: inventoryId,
      previous_quantity: prev,
      new_quantity: newStock,
      difference: difference,
      reason,
      notes: notes || null,
      admin_name: adminName
    });
  },
  
  async getDashboardStats() {
    // In a real app we'd use an RPC for complex aggregation, but we'll do basic counts here
    const [
      allRes,
      lowStockRes,
      outOfStockRes
    ] = await Promise.all([
      supabase.from('inventory_items').select('current_stock, buying_price', { count: 'exact' }),
      supabase.from('inventory_items').select('id', { count: 'exact', head: true }).eq('status', 'low_stock'),
      supabase.from('inventory_items').select('id', { count: 'exact', head: true }).eq('status', 'out_of_stock'),
    ]);

    if (allRes.error) {
      console.error("Supabase stats error (falling back):", allRes.error);
      const fallback = getFallbackInventory();
      let totalUnits = 0;
      let totalValue = 0;
      fallback.items.forEach(item => {
        totalUnits += item.currentStock;
        totalValue += item.currentStock * item.buyingPrice;
      });
      return {
        totalProducts: fallback.count,
        totalUnits,
        totalValue,
        lowStock: fallback.items.filter(i => i.status === 'low_stock').length,
        outOfStock: fallback.items.filter(i => i.status === 'out_of_stock').length,
      };
    }

    let totalUnits = 0;
    let totalValue = 0;
    
    allRes.data?.forEach(item => {
      totalUnits += (item.current_stock || 0);
      totalValue += (item.current_stock || 0) * (item.buying_price || 0);
    });

    return {
      totalProducts: allRes.count || 0,
      totalUnits: totalUnits,
      totalValue: totalValue,
      lowStock: lowStockRes.count || 0,
      outOfStock: outOfStockRes.count || 0,
    };
  }
};
