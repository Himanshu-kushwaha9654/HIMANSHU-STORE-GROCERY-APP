import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { AdminProductService } from "@/lib/services/admin/admin-product-service";
import { Product, MOCK_CATEGORIES, MOCK_BRANDS } from "@/lib/enterprise-data";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Save, Copy, Archive, Trash2, Image as ImageIcon, UploadCloud, X, ChevronDown, DollarSign, Package, LayoutDashboard, Truck, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/admin/products/$productId")({
  component: ProductEditPage,
});

function ProductEditPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await AdminProductService.getProductById(productId);
      if (data) {
        setProduct(data);
        setFormData(data);
      } else {
        toast.error("Product not found");
        navigate({ to: "/admin/products" });
      }
    } catch (err) {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!product) return;
    setIsSaving(true);
    try {
      await AdminProductService.updateProduct(product.id, formData);
      toast.success("Product updated successfully");
      setHasChanges(false);
      setProduct({ ...product, ...formData } as Product);
    } catch (err) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(true); // Simulate longer save, wait, actually we want false
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      await AdminProductService.deleteProduct(productId);
      toast.success("Product deleted");
      navigate({ to: "/admin/products" });
    }
  };

  // Derived calculations
  const profitMargin = useMemo(() => {
    if (!formData.price || !formData.costPrice) return 0;
    const profit = formData.price - formData.costPrice;
    return ((profit / formData.price) * 100).toFixed(1);
  }, [formData.price, formData.costPrice]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
          <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-medium text-sm">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto pb-32">
      
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-40 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-slate-200 -mx-6 px-6 py-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{product.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                formData.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                formData.status === 'archived' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-200 text-slate-700'
              }`}>
                {formData.status || 'Draft'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-0.5">SKU: {product.sku || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Copy className="size-4" />
            Duplicate
          </button>
          <div className="w-px h-6 bg-slate-300 mx-1" />
          <button 
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-rose-600 bg-white border border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition-colors shadow-sm"
          >
            <Trash2 className="size-4" />
          </button>
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Save className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <LayoutDashboard className="size-4.5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">Basic Information</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Product Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => handleUpdate('name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  placeholder="e.g., Premium Whole Wheat Bread"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                  <div className="relative">
                    <select 
                      value={formData.categoryId || ''}
                      onChange={e => handleUpdate('categoryId', e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                    >
                      <option value="">Select Category</option>
                      {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                  <div className="relative">
                    <select 
                      value={formData.brandId || ''}
                      onChange={e => handleUpdate('brandId', e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none"
                    >
                      <option value="">Select Brand</option>
                      {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Short Description</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => handleUpdate('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                  placeholder="A short summary of the product..."
                />
              </div>
            </div>
          </section>

          {/* Media / Images */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4.5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Media</h2>
              </div>
              <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700">Add from URL</button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="size-12 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="size-6 text-emerald-500" />
                </div>
                <p className="text-sm font-bold text-slate-800">Drag and drop your images here</p>
                <p className="text-xs font-medium text-slate-500 mt-1">or click to browse from your computer</p>
                <p className="text-xs font-medium text-slate-400 mt-4">Supports JPG, PNG, WEBP. Max 5MB per file.</p>
              </div>

              {/* Image Grid */}
              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                      <img src={img} alt="Product media" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-1.5 bg-white text-slate-700 rounded hover:bg-rose-50 hover:text-rose-600 transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          PRIMARY
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <DollarSign className="size-4.5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">Pricing</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price || ''} 
                    onChange={e => handleUpdate('price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold text-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">MRP / Compare at Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.compareAt || ''} 
                    onChange={e => handleUpdate('compareAt', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-500 font-medium line-through focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Cost Price per item (₹)</label>
                  <input 
                    type="number" 
                    value={formData.costPrice || ''} 
                    onChange={e => handleUpdate('costPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    placeholder="Used to calculate margins"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">GST (%)</label>
                  <input 
                    type="number" 
                    value={formData.gst || 0} 
                    onChange={e => handleUpdate('gst', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-700">Profit Margin</div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Calculated from Selling Price - Cost Price</div>
                </div>
                <div className={`text-xl font-black ${parseFloat(profitMargin as string) > 20 ? 'text-emerald-600' : parseFloat(profitMargin as string) > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {profitMargin}%
                </div>
              </div>
            </div>
          </section>

          {/* Inventory */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Package className="size-4.5 text-slate-400" />
              <h2 className="text-lg font-bold text-slate-800">Inventory & Logistics</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">SKU (Stock Keeping Unit)</label>
                <input 
                  type="text" 
                  value={formData.sku || ''} 
                  onChange={e => handleUpdate('sku', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Barcode (ISBN, UPC, GTIN)</label>
                <input 
                  type="text" 
                  value={formData.barcode || ''} 
                  onChange={e => handleUpdate('barcode', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Available Stock</label>
                <input 
                  type="number" 
                  value={formData.stockQty || 0} 
                  onChange={e => handleUpdate('stockQty', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Low Stock Alert Threshold</label>
                <input 
                  type="number" 
                  value={formData.minStock || 0} 
                  onChange={e => handleUpdate('minStock', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Metadata & Settings */}
        <div className="space-y-6">
          
          {/* Status */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Product Status</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={e => handleUpdate('status', e.target.value)}
                  className="size-4 text-emerald-600 focus:ring-emerald-500 border-slate-300" 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Active</span>
                  <span className="text-xs font-medium text-slate-500">Available on all sales channels</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={e => handleUpdate('status', e.target.value)}
                  className="size-4 text-slate-600 focus:ring-slate-500 border-slate-300" 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Draft</span>
                  <span className="text-xs font-medium text-slate-500">Hidden from all sales channels</span>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="radio" 
                  name="status" 
                  value="archived"
                  checked={formData.status === 'archived'}
                  onChange={e => handleUpdate('status', e.target.value)}
                  className="size-4 text-amber-600 focus:ring-amber-500 border-slate-300" 
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Archived</span>
                  <span className="text-xs font-medium text-slate-500">Archived but kept for historical records</span>
                </div>
              </label>
            </div>
          </section>

          {/* Analytics Widget */}
          <section className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden p-6 text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="size-24" />
            </div>
            <h2 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Activity className="size-4" /> Lifetime Analytics
            </h2>
            
            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="text-2xl font-black text-white">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(formData.revenue || 0)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Units Sold</p>
                  <p className="text-lg font-bold text-white">{new Intl.NumberFormat('en-IN').format(formData.unitsSold || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Page Views</p>
                  <p className="text-lg font-bold text-white">{new Intl.NumberFormat('en-IN').format(formData.views || 0)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Supplier */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
            <h2 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
              <Truck className="size-4" /> Supplier
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Supplier Name</label>
                <input 
                  type="text" 
                  value={formData.supplier || ''} 
                  onChange={e => handleUpdate('supplier', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={formData.supplierContact || ''} 
                  onChange={e => handleUpdate('supplierContact', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Last Restock Date</label>
                <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm font-medium">
                  {formData.lastPurchaseDate ? format(new Date(formData.lastPurchaseDate), "MMM d, yyyy") : "N/A"}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
