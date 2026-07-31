import React, { memo } from "react";
import { Search, Filter, Download, Upload, Plus, ChevronDown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AdminProductService } from "@/lib/services/admin/admin-product-service";
import { ImportExportService } from "@/lib/services/admin/import-export-service";
import { toast } from "sonner";
import { useRef } from "react";

interface ProductToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export const ProductToolbar = memo(function ProductToolbar({ searchQuery, onSearchChange }: ProductToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      toast.info("Preparing export...");
      const { products } = await AdminProductService.getAllProducts({ limit: 10000 }); // fetch all
      const csv = ImportExportService.exportProductsToCSV(products);
      ImportExportService.downloadCSV(csv);
      toast.success("Products exported successfully");
    } catch (error) {
      toast.error("Failed to export products");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info("Parsing CSV...");
      const csvString = await ImportExportService.readCSVFile(file);
      const parsedProducts = ImportExportService.parseCSVToProducts(csvString);
      
      if (parsedProducts.length === 0) {
        toast.error("No valid products found in CSV");
        return;
      }
      
      toast.success(`Found ${parsedProducts.length} products. Backend import not fully implemented in this phase.`);
      // In a real implementation we would send these to a bulk create API
    } catch (error) {
      toast.error("Failed to parse CSV file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white border-y border-slate-200 p-4 sticky top-16 z-20 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
      
      {/* Search and Filters */}
      <div className="flex-1 flex flex-wrap items-center gap-3 w-full">
        <div className="relative max-w-sm w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search products, SKU, or barcode..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
            <Filter className="size-3.5" />
            Category
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
            Brand
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
            Stock
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
            Status
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0">
            More Filters
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
        <button onClick={handleImportClick} className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <Upload className="size-4" />
          Import
        </button>
        <button onClick={handleExport} className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
          <Download className="size-4" />
          Export
        </button>
        <Link 
          to="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

    </div>
  );
});
