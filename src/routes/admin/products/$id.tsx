import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminProductService } from "@/lib/services/admin/admin-product-service";
import { Product, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_SUBCATEGORIES } from "@/lib/enterprise-data";
import { ArrowLeft, Save, Image as ImageIcon, Tag, Package, IndianRupee, Layers, Megaphone, UploadCloud, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/$id")({
  component: ProductEditor,
});

function ProductEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    categoryId: MOCK_CATEGORIES[0]?.id || "",
    subcategoryId: "",
    brandId: MOCK_BRANDS[0]?.id || "",
    price: 0,
    compareAt: undefined,
    costPrice: undefined,
    discount: 0,
    gst: 0,
    sku: "",
    barcode: "",
    stockQty: 0,
    minStock: 10,
    inStock: true,
    weight: "500g",
    unit: "pc",
    images: [],
    isOrganic: false,
    country: "India",
    deliveryTime: "10 Mins",
    status: 'draft',
    visibility: 'visible',
  });

  useEffect(() => {
    if (!isNew) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const product = await AdminProductService.getProductById(id);
    if (product) {
      setFormData(product);
    } else {
      toast.error("Product not found");
      navigate({ to: "/admin/products" });
    }
    setLoading(false);
  };

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Please fill all required fields (Name, Price, Category)");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await AdminProductService.createProduct({
          ...(formData as Omit<Product, "id">),
          slug: formData.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          rating: 0,
          reviews: 0,
          ingredients: formData.ingredients || "",
          nutritionFacts: formData.nutritionFacts || [],
          expiry: formData.expiry || "12 Months",
          storage: formData.storage || "Cool dry place",
        });
        toast.success("Product created successfully");
      } else {
        await AdminProductService.updateProduct(id, formData);
        toast.success("Product updated successfully");
      }
      navigate({ to: "/admin/products" });
    } catch (error) {
      toast.error(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading product data...</div>;
  }

  const tabs = [
    { id: "basic", label: "Basic Info", icon: Tag },
    { id: "pricing", label: "Pricing", icon: IndianRupee },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "variants", label: "Variants", icon: Layers },
    { id: "seo", label: "SEO & Homepage", icon: Megaphone },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-[#F8F9FA] pb-4 pt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: "/admin/products" })}
            className="size-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#2C2C2E] transition-colors shadow-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2E] tracking-tight">{isNew ? 'Add New Product' : 'Edit Product'}</h1>
            {!isNew && <p className="text-slate-500 font-medium text-sm mt-0.5">{formData.name}</p>}
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2C2C2E] hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="size-4.5" />}
          {saving ? 'Saving...' : 'Save Product'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Main Form Area */}
        <div className="flex-1 space-y-6">
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto custom-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${
                    isActive 
                      ? "border-emerald-500 text-emerald-600" 
                      : "border-transparent text-slate-500 hover:text-[#2C2C2E] hover:border-slate-300"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Product Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name || ""}
                    onChange={e => handleChange("name", e.target.value)}
                    placeholder="e.g. Farm Fresh Apples"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                  <textarea 
                    value={formData.description || ""}
                    onChange={e => handleChange("description", e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.categoryId || ""}
                      onChange={e => handleChange("categoryId", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      {MOCK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Sub Category</label>
                    <select 
                      value={formData.subcategoryId || ""}
                      onChange={e => handleChange("subcategoryId", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">None</option>
                      {MOCK_SUBCATEGORIES.filter(s => s.categoryId === formData.categoryId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Brand</label>
                    <select 
                      value={formData.brandId || ""}
                      onChange={e => handleChange("brandId", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="">None</option>
                      {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Origin Country</label>
                    <input 
                      type="text" 
                      value={formData.country || "India"}
                      onChange={e => handleChange("country", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Shelf Life (Expiry)</label>
                    <input 
                      type="text" 
                      value={formData.expiry || ""}
                      onChange={e => handleChange("expiry", e.target.value)}
                      placeholder="e.g. 12 Months"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Selling Price (₹) <span className="text-rose-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.price || ""}
                      onChange={e => handleChange("price", parseFloat(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">MRP / Compare at Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.compareAt || ""}
                      onChange={e => handleChange("compareAt", parseFloat(e.target.value))}
                      placeholder="Original price before discount"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Cost Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.costPrice || ""}
                      onChange={e => handleChange("costPrice", parseFloat(e.target.value))}
                      placeholder="Your cost to calculate margins"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">GST (%)</label>
                    <select 
                      value={formData.gst || 0}
                      onChange={e => handleChange("gst", parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value={0}>0% (Tax Free)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">SKU (Stock Keeping Unit)</label>
                    <input 
                      type="text" 
                      value={formData.sku || ""}
                      onChange={e => handleChange("sku", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Barcode</label>
                    <input 
                      type="text" 
                      value={formData.barcode || ""}
                      onChange={e => handleChange("barcode", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Stock Quantity</label>
                    <input 
                      type="number" 
                      value={formData.stockQty || 0}
                      onChange={e => handleChange("stockQty", parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Stock Alert</label>
                    <input 
                      type="number" 
                      value={formData.minStock || 10}
                      onChange={e => handleChange("minStock", parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Weight (e.g. 500g)</label>
                    <input 
                      type="text" 
                      value={formData.weight || ""}
                      onChange={e => handleChange("weight", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Unit Type</label>
                    <select 
                      value={formData.unit || "pc"}
                      onChange={e => handleChange("unit", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    >
                      <option value="pc">Piece (pc)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="L">Liter (L)</option>
                      <option value="ml">Milliliter (ml)</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                  <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <UploadCloud className="size-8 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-slate-700 text-lg">Upload Product Images</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm">Drag and drop your images here, or click to browse. Supported formats: JPG, PNG, WEBP (Max 5MB).</p>
                  <button className="mt-6 bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                    Browse Files
                  </button>
                </div>
                {/* Image Gallery mock */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                  {/* Mock Image */}
                  <div className="aspect-square rounded-xl border-2 border-emerald-500 bg-slate-100 flex items-center justify-center relative group overflow-hidden">
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">Primary</span>
                    <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200" alt="Mock" className="w-full h-full object-cover" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "variants" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Product Variants</h3>
                    <p className="text-sm text-slate-500 mt-1">Add options like sizes, weights, or colors.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">
                    <Plus className="size-4" /> Add Variant
                  </button>
                </div>

                <div className="text-center py-12 border border-slate-200 rounded-xl bg-slate-50">
                  <Layers className="size-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">No variants added yet</p>
                  <p className="text-sm text-slate-500 mt-1">This product currently has no variations.</p>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4">Search Engine Optimization</h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Meta Title</label>
                    <input 
                      type="text" 
                      placeholder="Title for search engines"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Meta Description</label>
                    <textarea 
                      placeholder="Brief description for search engines"
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-4 mt-8 pt-4">Homepage Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.visibility !== 'hidden'}
                      onChange={e => handleChange("visibility", e.target.checked ? 'visible' : 'hidden')}
                      className="size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-700">Visible on Storefront</p>
                      <p className="text-sm text-slate-500">Allow customers to see and purchase this product.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.isOrganic || false}
                      onChange={e => handleChange("isOrganic", e.target.checked)}
                      className="size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-700">Feature as Organic</p>
                      <p className="text-sm text-slate-500">Display the Organic badge and list in Organic sections.</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.flashSale || false}
                      onChange={e => handleChange("flashSale", e.target.checked)}
                      className="size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-700">Add to Flash Sale</p>
                      <p className="text-sm text-slate-500">Feature this product in the homepage Flash Sale carousel.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Product Status</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
              <select 
                value={formData.status || 'draft'}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                style={{
                  color: formData.status === 'active' ? '#059669' : formData.status === 'archived' ? '#ea580c' : '#475569',
                  backgroundColor: formData.status === 'active' ? '#ecfdf5' : formData.status === 'archived' ? '#fff7ed' : '#f8fafc',
                }}
              >
                <option value="active" className="text-emerald-700 font-bold">Active</option>
                <option value="draft" className="text-slate-700 font-bold">Draft</option>
                <option value="archived" className="text-orange-700 font-bold">Archived</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Draft products are hidden from the store. Active products are visible to customers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
