import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AdminInventoryService } from "@/lib/services/admin/admin-inventory-service";
import { InventoryItem, InventoryLog, DB } from "@/lib/enterprise-data";
import { toast } from "sonner";
import { 
  Search, Plus, Download, Package, TrendingDown, TrendingUp, AlertTriangle, XCircle, DollarSign,
  History, ArrowRightLeft, Image as ImageIcon, CheckCircle2, ChevronDown
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/inventory/")({
  component: AdminInventoryList,
});

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function AdminInventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('inventorySearch') || "" : "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [warehouseFilter, setWarehouseFilter] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('inventoryWarehouse') || "" : "");
  const [statusFilter, setStatusFilter] = useState(() => typeof window !== 'undefined' ? sessionStorage.getItem('inventoryStatus') || "" : "");
  
  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      sessionStorage.setItem('inventorySearch', searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Persist filters
  useEffect(() => {
    sessionStorage.setItem('inventoryWarehouse', warehouseFilter);
    sessionStorage.setItem('inventoryStatus', statusFilter);
  }, [warehouseFilter, statusFilter]);

  
  // Modal state
  const [activeModal, setActiveModal] = useState<'add' | 'remove' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState<InventoryLog['reason']>('manual_adjustment');
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminInventoryService.getAllInventory({
        search: debouncedSearch,
        warehouseFilter: warehouseFilter,
        statusFilter: statusFilter,
        limit: 100 // pagination placeholder
      });
      setItems(data.items);
      // Wait to get stats to avoid UI jumping, but stats are independent of current view filters usually.
      const st = await AdminInventoryService.getDashboardStats();
      setStats({
        ...st,
        filteredCount: data.count // Adding filtered count for the "Showing X of Y" text
      });
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, warehouseFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Backend search replaces local filtering
  const filteredItems = items;


  const handleAdjustStock = async () => {
    if (!selectedItem || adjustmentQty <= 0) return;
    
    try {
      const difference = activeModal === 'add' ? adjustmentQty : -adjustmentQty;
      await AdminInventoryService.adjustStock(
        selectedItem.id,
        difference,
        activeModal === 'add' ? 'added' : adjustmentReason,
        'Admin', // Mock admin user
        adjustmentNotes
      );
      toast.success(`Successfully ${activeModal === 'add' ? 'added' : 'removed'} ${adjustmentQty} units`);
      setActiveModal(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to adjust stock");
    }
  };

  const openModal = (type: 'add' | 'remove', item: InventoryItem) => {
    setSelectedItem(item);
    setActiveModal(type);
    setAdjustmentQty(0);
    setAdjustmentReason(type === 'add' ? 'added' : 'sold');
    setAdjustmentNotes("");
  };

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen -mt-6 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Track stock levels, value, and log movements across warehouses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/inventory/history"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <History className="size-4" /> View History
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="size-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Package className="size-3" /> Products</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Units</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalUnits}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="size-3" /> Value</p>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle className="size-3" /> Low Stock</p>
            <p className="text-2xl font-black text-amber-800">{stats.lowStock}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><XCircle className="size-3" /> Out of Stock</p>
            <p className="text-2xl font-black text-rose-800">{stats.outOfStock}</p>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-250px)] min-h-[500px] overflow-hidden">
        
        {/* Sticky Header Section */}
        <div className="shrink-0 bg-white z-20 border-b border-slate-200">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-sm w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, SKU, barcode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title="Clear Search"
                >
                  <XCircle className="size-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="text-sm text-slate-500 font-medium px-2 py-2 flex items-center">
                Showing {filteredItems.length} of {stats?.filteredCount || 0} products
              </div>
              <select 
                value={warehouseFilter}
                onChange={e => setWarehouseFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">All Warehouses</option>
                <option value="main">Main Store</option>
                <option value="godown">Godown</option>
              </select>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-t border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Product</div>
            <div className="col-span-2">SKU / Barcode</div>
            <div className="col-span-2 text-right">Available Stock</div>
            <div className="col-span-2 text-right">Unit / Total Value</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-2 text-right">Adjustments</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500 font-medium h-64">
              <Package className="size-12 text-slate-300 mb-4" />
              <p className="text-lg text-slate-700 font-bold">No products found.</p>
              <p className="text-sm text-slate-500 mb-6 mt-1">Try adjusting your search or filters to find what you're looking for.</p>
              {(debouncedSearch || warehouseFilter || statusFilter) && (
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setWarehouseFilter("");
                    setStatusFilter("");
                  }}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors">
                  
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="size-10 rounded-lg border border-slate-200 bg-white p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="size-4 text-slate-300" />
                      )}
                    </div>
                    <p className="font-bold text-slate-800 truncate text-sm">{item.productName}</p>
                  </div>

                  <div className="col-span-2 flex flex-col gap-0.5">
                    <span className="text-xs font-mono font-medium text-slate-700">{item.sku}</span>
                    <span className="text-[10px] font-mono text-slate-500">{item.barcode}</span>
                  </div>

                  <div className="col-span-2 text-right flex flex-col items-end gap-0.5">
                    <span className="font-black text-slate-800 text-base">{item.availableStock}</span>
                    <span className="text-[10px] font-medium text-slate-500">Reserved: {item.reservedStock}</span>
                  </div>

                  <div className="col-span-2 text-right flex flex-col items-end gap-0.5">
                    <span className="font-bold text-slate-700 text-sm">{formatCurrency(item.inventoryValue)}</span>
                    <span className="text-[10px] font-medium text-slate-500">at {formatCurrency(item.buyingPrice)}/u</span>
                  </div>

                  <div className="col-span-1 flex justify-center">
                    {item.status === 'healthy' && <div className="size-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50" title="Healthy Stock"></div>}
                    {item.status === 'low_stock' && <div className="size-3 rounded-full bg-amber-500 ring-4 ring-amber-50" title="Low Stock"></div>}
                    {item.status === 'out_of_stock' && <div className="size-3 rounded-full bg-rose-500 ring-4 ring-rose-50 animate-pulse" title="Out of Stock"></div>}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openModal('add', item)}
                      className="size-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                      title="Add Stock"
                    >
                      <Plus className="size-4" />
                    </button>
                    <button 
                      onClick={() => openModal('remove', item)}
                      className="size-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors"
                      title="Remove Stock"
                    >
                      <TrendingDown className="size-4" />
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <Dialog open={activeModal !== null} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeModal === 'add' ? <Plus className="size-5 text-emerald-600" /> : <TrendingDown className="size-5 text-rose-600" />}
              {activeModal === 'add' ? 'Add Stock' : 'Remove Stock'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="grid gap-4 py-4">
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
                <img src={selectedItem.productImage || ''} className="size-10 rounded-md object-contain bg-white border border-slate-200" />
                <div>
                  <p className="font-bold text-slate-800 text-sm line-clamp-1">{selectedItem.productName}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Current: {selectedItem.availableStock}</p>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Quantity to {activeModal}</label>
                <input 
                  type="number" 
                  min="1"
                  value={adjustmentQty || ''}
                  onChange={e => setAdjustmentQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {activeModal === 'remove' && (
                <div className="grid gap-2">
                  <label className="text-sm font-bold text-slate-700">Reason</label>
                  <select 
                    value={adjustmentReason}
                    onChange={e => setAdjustmentReason(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="sold">Sold (External)</option>
                    <option value="damaged">Damaged / Spoiled</option>
                    <option value="expired">Expired</option>
                    <option value="lost">Lost / Stolen</option>
                    <option value="manual_adjustment">Manual Correction</option>
                  </select>
                </div>
              )}

              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700">Notes (Optional)</label>
                <textarea 
                  value={adjustmentNotes}
                  onChange={e => setAdjustmentNotes(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-20"
                  placeholder="e.g. Supplier invoice #12345"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <button 
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleAdjustStock}
              disabled={adjustmentQty <= 0}
              className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                activeModal === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
