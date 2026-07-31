import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AdminCategoryService } from "@/lib/services/admin/admin-category-service";
import { Category } from "@/lib/enterprise-data";
import { ArrowLeft, Save, Image as ImageIcon, Tag, Layout, Megaphone, UploadCloud, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/categories/$id")({
  component: CategoryEditor,
});

function CategoryEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    icon: "",
    image: "",
    bannerImage: "",
    themeColor: "#10b981", // Emerald 500
    parentId: "",
    status: 'active',
    showOnHomepage: true,
    displayOrder: 0,
    featured: false,
    maxProducts: 10,
    seoTitle: "",
    seoDescription: ""
  });

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoading(true);
    const cats = await AdminCategoryService.getAllCategories();
    setAllCategories(cats);
    
    if (!isNew) {
      const category = cats.find(c => c.id === id);
      if (category) {
        setFormData(category);
      } else {
        toast.error("Category not found");
        navigate({ to: "/admin/categories" });
      }
    }
    setLoading(false);
  };

  const handleChange = (field: keyof Category, value: any) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Auto-generate slug if name changes and we are creating new
      if (field === 'name' && isNew) {
        next.slug = (value as string).toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and Slug are required fields.");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await AdminCategoryService.createCategory({
          ...formData as Omit<Category, "id" | "productCount">,
          icon: formData.icon || "default-icon",
          image: formData.image || "default-image"
        });
        toast.success("Category created successfully");
      } else {
        await AdminCategoryService.updateCategory(id, formData);
        toast.success("Category updated successfully");
      }
      navigate({ to: "/admin/categories" });
    } catch (error) {
      toast.error(`Failed to save category: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading category data...</div>;
  }

  const tabs = [
    { id: "basic", label: "General Information", icon: Tag },
    { id: "images", label: "Media & Icons", icon: ImageIcon },
    { id: "homepage", label: "Homepage Layout", icon: Layout },
    { id: "seo", label: "SEO Settings", icon: Megaphone },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-[#F8F9FA] pb-4 pt-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate({ to: "/admin/categories" })}
            className="size-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#2C2C2E] transition-colors shadow-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2C2C2E] tracking-tight">{isNew ? 'Create Category' : 'Edit Category'}</h1>
            {!isNew && <p className="text-slate-500 font-medium text-sm mt-0.5">{formData.name}</p>}
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#2C2C2E] hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="size-4.5" />}
          {saving ? 'Saving...' : 'Save Category'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.name || ""}
                      onChange={e => handleChange("name", e.target.value)}
                      placeholder="e.g. Fresh Fruits"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">URL Slug <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.slug || ""}
                      onChange={e => handleChange("slug", e.target.value)}
                      placeholder="e.g. fresh-fruits"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Description</label>
                  <textarea 
                    value={formData.description || ""}
                    onChange={e => handleChange("description", e.target.value)}
                    placeholder="Brief description of this category..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Parent Category (Optional)</label>
                  <select 
                    value={formData.parentId || ""}
                    onChange={e => handleChange("parentId", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">None (Top Level Category)</option>
                    {allCategories.filter(c => c.id !== id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-8">
                
                {/* Main Category Image */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Category Image</h3>
                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <UploadCloud className="size-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-500 mb-4 max-w-xs">Upload a primary image for grid layouts (e.g. 400x400px JPG/PNG).</p>
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors">
                      Browse Image
                    </button>
                  </div>
                </div>

                {/* Banner Image */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Homepage Banner (Optional)</h3>
                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <ImageIcon className="size-6 text-emerald-500" />
                    </div>
                    <p className="text-sm text-slate-500 mb-4 max-w-xs">Upload a wide banner image to display above the products on the homepage.</p>
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors">
                      Browse Banner
                    </button>
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Theme Color</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={formData.themeColor || "#10b981"}
                      onChange={e => handleChange("themeColor", e.target.value)}
                      className="size-12 rounded cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input 
                      type="text" 
                      value={formData.themeColor || "#10b981"}
                      onChange={e => handleChange("themeColor", e.target.value)}
                      className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Used as the background color for category icons and badges.</p>
                </div>
              </div>
            )}

            {activeTab === "homepage" && (
              <div className="space-y-6">
                
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.showOnHomepage || false}
                      onChange={e => handleChange("showOnHomepage", e.target.checked)}
                      className="mt-1 size-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-emerald-800 text-base">Show on Homepage</p>
                      <p className="text-sm text-emerald-700/80 mt-1">If enabled, this category and its products will automatically generate a dedicated carousel section on the storefront homepage.</p>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-100 transition-opacity" style={{ opacity: formData.showOnHomepage ? 1 : 0.5 }}>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Maximum Products on Homepage</label>
                    <input 
                      type="number" 
                      value={formData.maxProducts || 10}
                      onChange={e => handleChange("maxProducts", parseInt(e.target.value))}
                      disabled={!formData.showOnHomepage}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Limit how many products show in the carousel before user clicks "See All".</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Homepage Display Order</label>
                    <input 
                      type="number" 
                      value={formData.displayOrder || 0}
                      onChange={e => handleChange("displayOrder", parseInt(e.target.value))}
                      disabled={!formData.showOnHomepage}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all disabled:opacity-50"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">Lower numbers appear first on the page (0 is highest priority).</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={formData.featured || false}
                      onChange={e => handleChange("featured", e.target.checked)}
                      className="mt-0.5 size-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-bold text-slate-700">Featured Category</p>
                      <p className="text-sm text-slate-500 mt-0.5">Highlight this category in navigation menus and special featured sections.</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">SEO Meta Title</label>
                  <input 
                    type="text" 
                    value={formData.seoTitle || ""}
                    onChange={e => handleChange("seoTitle", e.target.value)}
                    placeholder={`e.g. Buy ${formData.name || 'Products'} Online`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Shown as the clickable headline in Google Search results.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">SEO Meta Description</label>
                  <textarea 
                    value={formData.seoDescription || ""}
                    onChange={e => handleChange("seoDescription", e.target.value)}
                    placeholder="Brief description for search engines"
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#2C2C2E] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Category Status</h3>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Visibility</label>
              <select 
                value={formData.status || 'draft'}
                onChange={e => handleChange("status", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                style={{
                  color: formData.status === 'active' ? '#059669' : formData.status === 'hidden' ? '#ea580c' : '#475569',
                  backgroundColor: formData.status === 'active' ? '#ecfdf5' : formData.status === 'hidden' ? '#fff7ed' : '#f8fafc',
                }}
              >
                <option value="active" className="text-emerald-700 font-bold">Active</option>
                <option value="hidden" className="text-orange-700 font-bold">Hidden</option>
                <option value="draft" className="text-slate-700 font-bold">Draft</option>
              </select>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Draft/Hidden categories and their products will not appear on the storefront.
              </p>
            </div>
            
            {!isNew && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">Products in Category</p>
                <p className="text-2xl font-black text-slate-800">{formData.productCount || 0}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
