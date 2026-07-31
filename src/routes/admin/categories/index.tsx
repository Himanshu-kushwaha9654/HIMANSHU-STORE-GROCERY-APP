import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AdminCategoryService } from "@/lib/services/admin/admin-category-service";
import { Category } from "@/lib/enterprise-data";
import { toast } from "sonner";
import { 
  FolderTree, Search, Plus, Upload, Download, MoreVertical, 
  Trash2, Eye, EyeOff, Edit3, Image as ImageIcon, CheckCircle2,
  GripVertical, Home, Star, AlertCircle
} from "lucide-react";
import { Reorder } from "framer-motion";

export const Route = createFileRoute("/admin/categories/")({
  component: AdminCategoriesList,
});

function AdminCategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminCategoryService.getAllCategories();
      setCategories(data);
      const st = await AdminCategoryService.getDashboardStats();
      setStats(st);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtering based on search (happens locally since reorder needs full list)
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReorder = async (newOrder: Category[]) => {
    // Optimistic UI update
    setCategories(newOrder);
    
    // Background sync
    const orderedIds = newOrder.map(c => c.id);
    try {
      await AdminCategoryService.updateDisplayOrder(orderedIds);
    } catch {
      toast.error("Failed to save category order");
      loadData(); // Revert on failure
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await AdminCategoryService.deleteCategory(id);
      toast.success("Category deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete category");
    }
  };

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen -mt-6 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Categories</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage categories, subcategories, and homepage placement.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <Download className="size-4" /> Export
          </button>
          <Link 
            to="/admin/categories/$id"
            params={{ id: 'new' }}
            className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2E] hover:bg-black text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
          >
            <Plus className="size-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Dashboard Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total</p>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1">Active</p>
            <p className="text-2xl font-black text-slate-800">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">Hidden</p>
            <p className="text-2xl font-black text-slate-800">{stats.hidden}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Home className="size-3" /> Homepage</p>
            <p className="text-2xl font-black text-emerald-800">{stats.homepage}</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><Star className="size-3" /> Featured</p>
            <p className="text-2xl font-black text-amber-800">{stats.featured}</p>
          </div>
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><AlertCircle className="size-3" /> Empty</p>
            <p className="text-2xl font-black text-rose-800">{stats.empty}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-240px)] min-h-[500px] overflow-hidden">
        
        {/* Fixed Header: Toolbar + Table Columns */}
        <div className="shrink-0 bg-white z-20 border-b border-slate-200">
          {/* Search Bar */}
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-sm w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <p className="text-sm font-medium text-slate-500">
              <span className="font-bold text-slate-700">Tip:</span> Drag and drop the handle (⋮⋮) to reorder categories.
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-1 text-center">Order</div>
            <div className="col-span-4">Category</div>
            <div className="col-span-2">Products</div>
            <div className="col-span-2">Homepage</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
        </div>

        {/* Scrollable Category List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 bg-white">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No categories found.</div>
          ) : (
            <Reorder.Group axis="y" values={filteredCategories} onReorder={handleReorder} className="flex flex-col min-h-full">
              {filteredCategories.map((category) => (
                <Reorder.Item 
                  key={category.id} 
                  value={category}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors bg-white cursor-default relative z-0"
                >
                  {/* Drag Handle */}
                  <div className="col-span-1 flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                    <GripVertical className="size-5" />
                  </div>
                  
                  {/* Name & Image */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="size-12 rounded-xl border border-slate-200 bg-white p-2 shrink-0 flex items-center justify-center overflow-hidden">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="size-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{category.name}</p>
                      <p className="text-xs text-slate-500 truncate">/{category.slug}</p>
                    </div>
                  </div>

                  {/* Product Count */}
                  <div className="col-span-2">
                    <span className="font-bold text-slate-700">{category.productCount || 0}</span>
                    <span className="text-xs text-slate-500 ml-1">items</span>
                  </div>

                  {/* Homepage Status */}
                  <div className="col-span-2 flex flex-col items-start gap-1">
                    {category.showOnHomepage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="size-3" /> Visible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                        Hidden
                      </span>
                    )}
                    {category.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider">
                        <Star className="size-3" /> Featured
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      category.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                      category.status === 'hidden' ? 'bg-orange-50 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {category.status || 'Active'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <Link 
                      to="/admin/categories/$id"
                      params={{ id: category.id }}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="size-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>

    </div>
  );
}
