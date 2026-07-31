import { Product, DB } from "@/lib/enterprise-data";

// Key for LocalStorage persistence during development
const ADMIN_PRODUCTS_KEY = "admin_products_catalog";

/**
 * Admin Product Service
 * 
 * Simulated backend that uses LocalStorage for persistence.
 * Reverts to local storage because the user does not have access to the Lovable-provisioned Supabase SQL dashboard to run migrations.
 */
export const AdminProductService = {
  
  _getStorage(): Product[] {
    if (typeof localStorage === 'undefined') {
      return DB.products.findMany({ limit: 100 }) as Product[];
    }

    const data = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    
    // Seed with initial mock data
    const initial = DB.products.findMany({ limit: 1000 }).map(p => {
      const costPrice = Math.round(p.price * 0.7);
      return {
        ...p,
        supplier: p.supplier || "Fresh Farms LLC",
        status: p.status || (p.stockQty > 0 ? 'active' : 'draft'),
        visibility: p.visibility || 'visible',
        lastUpdated: p.lastUpdated || new Date().toISOString(),
        costPrice: p.costPrice || costPrice,
        gst: p.gst || 5,
        minStock: p.minStock || 10,
      };
    });
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(initial));
    return initial as Product[];
  },

  _saveStorage(products: Product[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
    }
  },

  async getAllProducts(options?: { page?: number; limit?: number; search?: string }): Promise<{ products: Product[], total: number }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let products = this._getStorage();
    
    if (options?.search) {
      const query = options.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.sku && p.sku.toLowerCase().includes(query)) || 
        (p.barcode && p.barcode.toLowerCase().includes(query))
      );
    }
    
    products.sort((a, b) => {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateB - dateA;
    });

    const total = products.length;
    
    if (options?.page && options?.limit) {
      const start = (options.page - 1) * options.limit;
      products = products.slice(start, start + options.limit);
    }
    
    return { products, total };
  },

  async getProductById(id: string): Promise<Product | undefined> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const products = this._getStorage();
    return products.find(p => p.id === id);
  },

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const products = this._getStorage();
    
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      lastUpdated: new Date().toISOString()
    };

    products.unshift(newProduct);
    this._saveStorage(products);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const products = this._getStorage();
    
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");

    const updatedProduct = { 
        ...products[index], 
        ...updates,
        lastUpdated: new Date().toISOString()
    };
    products[index] = updatedProduct;
    
    this._saveStorage(products);
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    let products = this._getStorage();
    products = products.filter(p => p.id !== id);
    this._saveStorage(products);
  },
  
  async bulkDelete(ids: string[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    let products = this._getStorage();
    products = products.filter(p => !ids.includes(p.id));
    this._saveStorage(products);
  },
  
  async bulkUpdateCategory(ids: string[], categoryId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const products = this._getStorage();
    products.forEach(p => {
        if (ids.includes(p.id)) {
            p.categoryId = categoryId;
            p.lastUpdated = new Date().toISOString();
        }
    });
    this._saveStorage(products);
  },

  async bulkUpdateStatus(ids: string[], status: 'active' | 'draft' | 'archived'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const products = this._getStorage();
    products.forEach(p => {
        if (ids.includes(p.id)) {
            p.status = status;
            p.lastUpdated = new Date().toISOString();
        }
    });
    this._saveStorage(products);
  },

  async bulkUpdateVisibility(ids: string[], visibility: 'visible' | 'hidden'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const products = this._getStorage();
    products.forEach(p => {
        if (ids.includes(p.id)) {
            p.visibility = visibility;
            p.lastUpdated = new Date().toISOString();
        }
    });
    this._saveStorage(products);
  }
};
