import React, { memo, useState } from "react";
import { format } from "date-fns";
import { Eye, Edit2, Copy, Trash2, MoreHorizontal, Image as ImageIcon, Tag, IndianRupee, Package, Star, Power } from "lucide-react";
import { Product, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SUBCATEGORIES } from "@/lib/enterprise-data";
import { Link } from "@tanstack/react-router";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AdminProductService } from "@/lib/services/admin/admin-product-service";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  isLoading: boolean;
}

const getPlaceholderImage = (categoryId: string) => {
  const c = categoryId?.toLowerCase() || "";
  if (c.includes("milk") || c.includes("dairy")) return "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("bread") || c.includes("bakery")) return "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("rice") || c.includes("grain") || c.includes("staples")) return "https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("veg")) return "https://images.unsplash.com/photo-1566385106758-367d4bea8806?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("fruit")) return "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("snack")) return "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("beverage") || c.includes("drink")) return "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("care") || c.includes("personal")) return "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=96&h=96";
  if (c.includes("clean") || c.includes("household")) return "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&q=80&w=96&h=96";
  
  return "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=96&h=96";
};

const ProductRow = memo(({ product, isSelected, onToggleSelect }: { product: Product, isSelected: boolean, onToggleSelect: (id: string) => void }) => {
  const price = product.discount > 0 ? product.price - (product.price * product.discount / 100) : product.price;

  const categoryName = MOCK_CATEGORIES.find(c => c.id === product.categoryId)?.name || product.categoryId;
  const subCategoryName = MOCK_SUBCATEGORIES.find(s => s.id === product.subcategoryId)?.name || product.subcategoryId;
  const brandName = MOCK_BRANDS.find(b => b.id === product.brandId)?.name || product.brandId;

  const handleDuplicate = async () => {
    toast.info("Duplicating product...");
  };

  const handleToggleStatus = async () => {
    toast.info("Toggling status...");
  };

  const handleToggleFeature = async () => {
    toast.info("Toggling homepage feature...");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await AdminProductService.deleteProduct(product.id);
      toast.success("Product deleted successfully");
      // Typically we'd need to trigger a refresh here via Context or Props, 
      // but for this phase, user should refresh or it will sync via websockets in real implementation.
    }
  };

  return (
    <tr className={`hover:bg-slate-50 transition-colors group relative ${isSelected ? 'bg-emerald-50/50' : 'bg-white'}`}>
      
      {/* 1. Checkbox */}
      <td className="p-4 w-10 sticky left-0 z-10 bg-inherit border-b border-slate-100">
        <input 
          type="checkbox" 
          className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
        />
      </td>

      {/* 2. Image */}
      <td className="px-4 py-4 w-16 min-w-[64px] border-b border-slate-100">
        <div className="size-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
          <img 
            src={product.images && product.images.length > 0 ? product.images[0] : getPlaceholderImage(categoryName)} 
            alt={product.name} 
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage(categoryName);
            }}
            className="w-full h-full object-cover" 
          />
        </div>
      </td>

      {/* 3. Product Name */}
      <td className="px-4 py-4 font-medium text-slate-900 whitespace-normal min-w-[200px] border-b border-slate-100">
        <Link to={`/admin/products/${product.id}`} className="font-bold text-slate-800 hover:text-emerald-600 hover:underline line-clamp-2">
          {product.name}
        </Link>
        <div className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">{product.supplier || "Unknown Supplier"}</div>
      </td>

      {/* 4. Brand */}
      <td className="px-4 py-4 text-slate-700 border-b border-slate-100">
        {brandName}
      </td>

      {/* 5. Category */}
      <td className="px-4 py-4 text-slate-700 border-b border-slate-100">
        {categoryName}
      </td>
      
      {/* 6. Sub Category */}
      <td className="px-4 py-4 text-slate-500 border-b border-slate-100">
        {subCategoryName || "-"}
      </td>

      {/* 7. SKU */}
      <td className="px-4 py-4 text-slate-700 font-medium border-b border-slate-100">
        {product.sku || "N/A"}
      </td>

      {/* 8. Barcode */}
      <td className="px-4 py-4 text-slate-500 text-xs border-b border-slate-100">
        {product.barcode || "N/A"}
      </td>

      {/* 9. MRP */}
      <td className="px-4 py-4 text-slate-500 border-b border-slate-100 text-right">
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
      </td>

      {/* 10. Selling Price */}
      <td className="px-4 py-4 font-bold text-slate-800 border-b border-slate-100 text-right">
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price)}
      </td>
      
      {/* 11. Discount % */}
      <td className="px-4 py-4 font-bold text-emerald-600 border-b border-slate-100 text-right">
        {product.discount > 0 ? `${product.discount}%` : "-"}
      </td>

      {/* 12. Current Stock */}
      <td className="px-4 py-4 border-b border-slate-100 text-right">
        <span className={`font-bold ${
          product.stockQty === 0 ? 'text-rose-600' :
          product.stockQty <= (product.minStock || 10) ? 'text-amber-600' : 'text-slate-700'
        }`}>
          {product.stockQty}
        </span>
      </td>

      {/* 13. Unit */}
      <td className="px-4 py-4 text-slate-500 border-b border-slate-100">
        {product.unit || "pc"}
      </td>

      {/* 14. Product Status */}
      <td className="px-4 py-4 border-b border-slate-100">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
          product.stockQty === 0 ? 'bg-rose-50 text-rose-700' :
          product.status === 'draft' ? 'bg-slate-100 text-slate-600' :
          product.status === 'archived' ? 'bg-orange-50 text-orange-700' :
          product.stockQty <= (product.minStock || 10) ? 'bg-amber-50 text-amber-700' :
          'bg-emerald-50 text-emerald-700'
        }`}>
          {product.stockQty === 0 ? 'Out of Stock' :
           product.status === 'draft' ? 'Draft' :
           product.status === 'archived' ? 'Archived' :
           product.stockQty <= (product.minStock || 10) ? 'Low Stock' : 'Active'}
        </span>
      </td>

      {/* 15. Homepage Visibility & Featured */}
      <td className="px-4 py-4 border-b border-slate-100">
        <div className="flex gap-2">
          {product.visibility !== 'hidden' ? (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700">Visible</span>
          ) : (
             <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Hidden</span>
          )}
          
          {(product.isOrganic || product.flashSale) && (
            <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 flex items-center gap-1">
              <Star className="size-2.5" /> Featured
            </span>
          )}
        </div>
      </td>

      {/* 16. Last Updated */}
      <td className="px-4 py-4 text-xs font-medium text-slate-500 border-b border-slate-100">
        {product.lastUpdated ? format(new Date(product.lastUpdated), "MMM d, yyyy") : "N/A"}
      </td>

      {/* 17. Actions */}
      <td className="px-4 py-4 text-right border-b border-slate-100 sticky right-0 z-10 bg-inherit w-16 min-w-[64px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-400 hover:text-slate-600 p-2 outline-none">
              <MoreHorizontal className="size-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 z-50">
            <DropdownMenuLabel>Product Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={`/products/${product.id}`} target="_blank" className="cursor-pointer">
                <Eye className="mr-2 size-4" /> View Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/admin/products/${product.id}`} className="cursor-pointer">
                <Edit2 className="mr-2 size-4" /> Edit Product
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer">
              <Copy className="mr-2 size-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <IndianRupee className="mr-2 size-4" /> Change Price
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Package className="mr-2 size-4" /> Update Stock
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <ImageIcon className="mr-2 size-4" /> Upload Images
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Tag className="mr-2 size-4" /> Manage Variants
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
              <Power className="mr-2 size-4" /> Enable / Disable
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleToggleFeature} className="cursor-pointer">
              <Star className="mr-2 size-4" /> Feature on Homepage
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50">
              <Trash2 className="mr-2 size-4" /> Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}, (prev, next) => {
  return prev.product.id === next.product.id && prev.isSelected === next.isSelected && prev.product.updated_at === next.product.updated_at;
});

export const ProductTable = memo(function ProductTable({ products, selectedIds, onToggleSelect, onToggleSelectAll, isLoading }: ProductTableProps) {
  const allSelected = products.length > 0 && selectedIds.size === products.length;

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-slate-400">
        <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-medium">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-xl mt-4">
        <p className="font-bold text-lg text-slate-800">No products found</p>
        <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full relative mt-4 flex flex-col max-h-[600px]">
      <div className="overflow-auto custom-scrollbar flex-1 relative">
        <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap min-w-max border-collapse">
          <thead className="text-xs uppercase bg-slate-50 text-slate-500 font-bold tracking-wider sticky top-0 z-20 shadow-sm">
            <tr>
              <th scope="col" className="p-4 w-10 sticky left-0 z-30 bg-slate-50 border-b border-slate-200">
                <input 
                  type="checkbox" 
                  className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                />
              </th>
              <th scope="col" className="px-4 py-4 w-16 border-b border-slate-200 bg-slate-50">Image</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Product Name</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Brand</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Category</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Sub Category</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">SKU</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Barcode</th>
              <th scope="col" className="px-4 py-4 text-right border-b border-slate-200 bg-slate-50">MRP</th>
              <th scope="col" className="px-4 py-4 text-right border-b border-slate-200 bg-slate-50">Selling Price</th>
              <th scope="col" className="px-4 py-4 text-right border-b border-slate-200 bg-slate-50">Disc %</th>
              <th scope="col" className="px-4 py-4 text-right border-b border-slate-200 bg-slate-50">Current Stock</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Unit</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Status</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Visibility</th>
              <th scope="col" className="px-4 py-4 border-b border-slate-200 bg-slate-50">Last Updated</th>
              <th scope="col" className="px-4 py-4 text-right sticky right-0 z-30 bg-slate-50 border-b border-slate-200 w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {products.map((product) => (
              <ProductRow 
                key={product.id}
                product={product}
                isSelected={selectedIds.has(product.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
