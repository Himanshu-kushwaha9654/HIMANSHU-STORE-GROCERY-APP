import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { AdminProductService } from "@/lib/services/admin/admin-product-service";
import { Product } from "@/lib/enterprise-data";
import { ProductSummaryCards } from "@/components/admin/products/ProductSummaryCards";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { BulkActionsBar } from "@/components/admin/products/BulkActionsBar";
import { ProductPagination } from "@/components/admin/products/ProductPagination";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsList,
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [summaryProducts, setSummaryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load just the paginated data for the table
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminProductService.getAllProducts({
        page,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch
      });
      setProducts(data.products);
      setTotalProducts(data.total);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  // Load all products once for summary metrics
  const loadSummaryData = useCallback(async () => {
    try {
      const data = await AdminProductService.getAllProducts();
      setSummaryProducts(data.products);
    } catch (error) {
      console.error("Failed to load summary data", error);
    }
  }, []);

  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === products.length && products.length > 0) {
        return new Set();
      }
      return new Set(products.map(p => p.id));
    });
  }, [products]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleBulkAction = useCallback(async (action: string) => {
    try {
      const ids = Array.from(selectedIds);
      if (action === "delete") {
        if (window.confirm(`Are you sure you want to delete ${ids.length} products?`)) {
          await AdminProductService.bulkDelete(ids);
          toast.success(`Deleted ${ids.length} products`);
        } else {
          return; // Cancelled
        }
      } else if (action === "publish") {
        await AdminProductService.bulkUpdateStatus(ids, 'active');
        await AdminProductService.bulkUpdateVisibility(ids, 'visible');
        toast.success(`Published ${ids.length} products`);
      } else if (action === "hide") {
        await AdminProductService.bulkUpdateVisibility(ids, 'hidden');
        toast.success(`Hidden ${ids.length} products`);
      } else {
        toast.info(`Bulk action '${action}' applied to ${ids.length} products.`);
      }
      setSelectedIds(new Set());
      loadProducts();
      loadSummaryData();
    } catch (error) {
      toast.error(`Failed to apply action: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [selectedIds, loadProducts, loadSummaryData]);

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen -mt-6 pt-6 px-4 md:px-8">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Products</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage your catalog, inventory, and pricing.</p>
      </div>

      <ProductSummaryCards products={summaryProducts} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <ProductToolbar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="p-4 bg-slate-50/50">
          <ProductTable 
            products={products}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            isLoading={loading}
          />

          <ProductPagination 
            total={totalProducts} 
            currentPage={page} 
            itemsPerPage={ITEMS_PER_PAGE} 
            onPageChange={setPage}
          />
        </div>
      </div>

      <BulkActionsBar 
        selectedCount={selectedIds.size}
        onClear={handleClearSelection}
        onAction={handleBulkAction}
      />
    </div>
  );
}
