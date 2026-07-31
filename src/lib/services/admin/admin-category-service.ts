import { Category, DB } from "@/lib/enterprise-data";

const ADMIN_CATEGORIES_KEY = "admin_categories_db";

export const AdminCategoryService = {
  
  _getStorage(): Category[] {
    if (typeof localStorage === 'undefined') {
      return DB.categories.findMany({ limit: 100 }) as Category[];
    }

    const data = localStorage.getItem(ADMIN_CATEGORIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Seed with initial mock data and add new properties
    const initial = DB.categories.findMany({ limit: 100 }).map((c, i) => {
      // Simulate real data
      return {
        ...c,
        description: `Everything you need in the ${c.name} category.`,
        status: (c as any).active === false ? 'hidden' : 'active',
        showOnHomepage: (c as any).visibleOnHomepage ?? true,
        displayOrder: (c as any).displayOrder ?? i,
        featured: (c as any).featured ?? false,
        maxProducts: 10,
        productCount: Math.floor(Math.random() * 200) + 10, // Mock count
        seoTitle: `Buy ${c.name} Online`,
        seoDescription: `Get fresh ${c.name} delivered instantly.`
      };
    });
    
    localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(initial));
    return initial as Category[];
  },

  _saveStorage(categories: Category[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_CATEGORIES_KEY, JSON.stringify(categories));
    }
  },

  async getAllCategories(options?: { search?: string }): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let categories = this._getStorage();
    
    if (options?.search) {
      const query = options.search.toLowerCase();
      categories = categories.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.slug.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query))
      );
    }
    
    categories.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return categories;
  },

  async getCategoryById(id: string): Promise<Category | undefined> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const categories = this._getStorage();
    return categories.find(c => c.id === id);
  },

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    
    const newCategory: Category = {
      ...category,
      id: `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productCount: 0
    };

    categories.push(newCategory);
    this._saveStorage(categories);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Category not found");

    const updatedCategory = { ...categories[index], ...updates };
    categories[index] = updatedCategory;
    
    this._saveStorage(categories);
    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return;
    
    if (categories[index].productCount && categories[index].productCount! > 0) {
      throw new Error(`Cannot delete: This category contains ${categories[index].productCount} products. Move products to another category before deleting.`);
    }

    const filtered = categories.filter(c => c.id !== id);
    this._saveStorage(filtered);
  },

  async bulkUpdateStatus(ids: string[], status: 'active' | 'hidden' | 'draft'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    categories.forEach(c => {
      if (ids.includes(c.id)) c.status = status;
    });
    this._saveStorage(categories);
  },

  async bulkUpdateHomepage(ids: string[], showOnHomepage: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    categories.forEach(c => {
      if (ids.includes(c.id)) c.showOnHomepage = showOnHomepage;
    });
    this._saveStorage(categories);
  },
  
  async bulkUpdateFeatured(ids: string[], featured: boolean): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const categories = this._getStorage();
    categories.forEach(c => {
      if (ids.includes(c.id)) c.featured = featured;
    });
    this._saveStorage(categories);
  },

  async updateDisplayOrder(categoryIdsInOrder: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const categories = this._getStorage();
    
    // Create a map for O(1) lookup
    const orderMap = new Map<string, number>();
    categoryIdsInOrder.forEach((id, index) => {
      orderMap.set(id, index);
    });

    categories.forEach(c => {
      if (orderMap.has(c.id)) {
        c.displayOrder = orderMap.get(c.id);
      }
    });

    this._saveStorage(categories);
  },
  
  async getDashboardStats() {
    await new Promise(resolve => setTimeout(resolve, 150));
    const categories = this._getStorage();
    
    return {
      total: categories.length,
      active: categories.filter(c => c.status === 'active').length,
      hidden: categories.filter(c => c.status === 'hidden' || c.status === 'draft').length,
      featured: categories.filter(c => c.featured).length,
      homepage: categories.filter(c => c.showOnHomepage).length,
      empty: categories.filter(c => !c.productCount || c.productCount === 0).length,
    };
  }
};
