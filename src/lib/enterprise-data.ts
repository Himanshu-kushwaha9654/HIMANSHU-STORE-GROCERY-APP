import catalog from './catalog.json';

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image: string;
  bannerImage?: string;
  themeColor?: string;
  parentId?: string;
  
  // Admin & Display fields
  status?: 'active' | 'hidden' | 'draft';
  showOnHomepage?: boolean;
  displayOrder?: number;
  featured?: boolean;
  maxProducts?: number;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Derived
  productCount?: number;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface NutritionFact {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  sku: string;
  barcode: string;
  price: number;
  compareAt: number | null;
  discount: number;
  images: string[];
  ingredients: string;
  nutritionFacts: NutritionFact[];
  expiry: string;
  storage: string;
  unit: string;
  weight: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  inStock: boolean;
  stockQty: number;
  country: string;
  isOrganic: boolean;
  flashSale?: boolean;
  
  // Admin fields (added for dashboard)
  supplier?: string;
  status?: 'active' | 'draft' | 'archived';
  visibility?: 'visible' | 'hidden';
  lastUpdated?: string;

  // New Phase 2.2 Fields
  costPrice?: number;
  gst?: number;
  minStock?: number;
  supplierContact?: string;
  lastPurchaseDate?: string;
  unitsSold?: number;
  revenue?: number;
  views?: number;
  wishlistCount?: number;
}

export const MOCK_BRANDS: Brand[] = catalog.brands as Brand[];
export const MOCK_CATEGORIES: Category[] = catalog.categories as Category[];
export const MOCK_SUBCATEGORIES: Subcategory[] = catalog.subcategories as Subcategory[];
export const MOCK_PRODUCTS: Product[] = catalog.products.map((p: any) => ({
  ...p,
  rating: parseFloat(p.rating), // Parse float back since json stores it as string if we used toFixed
  flashSale: p.discount >= 20 || p.name.toLowerCase().includes('milk'),
  stockQty: p.discount >= 20 ? Math.floor(Math.random() * 15) : p.stockQty || 50, // Force some low stock for flash sales
})) as Product[];

// Query Helpers to mimic a real database
export const DB = {
  products: {
    findMany: (options?: { 
      categoryId?: string; 
      subcategoryId?: string; 
      brandId?: string; 
      limit?: number;
      search?: string;
      isOrganic?: boolean;
      hasOffers?: boolean;
      fastDelivery?: boolean;
      flashSale?: boolean;
      sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
    }) => {
      let result = MOCK_PRODUCTS;
      
      // SYNC WITH ADMIN PANEL EDITS
      if (typeof localStorage !== 'undefined') {
        const adminData = localStorage.getItem("admin_products");
        if (adminData) {
          result = JSON.parse(adminData);
        }
      }
      
      if (options?.categoryId) result = result.filter(p => p.categoryId === options.categoryId);
      if (options?.subcategoryId) result = result.filter(p => p.subcategoryId === options.subcategoryId);
      if (options?.brandId) result = result.filter(p => p.brandId === options.brandId);
      if (options?.isOrganic) result = result.filter(p => p.isOrganic);
      if (options?.hasOffers) result = result.filter(p => p.discount > 0);
      if (options?.fastDelivery) result = result.filter(p => p.deliveryTime.toLowerCase().includes('10 mins') || p.deliveryTime.toLowerCase().includes('8 mins'));
      if (options?.flashSale) result = result.filter(p => p.flashSale);
      
      if (options?.search) {
        const query = options.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
      }

      if (options?.sortBy) {
        result = [...result]; // avoid mutating original
        switch (options.sortBy) {
          case 'price_asc': result.sort((a, b) => a.price - b.price); break;
          case 'price_desc': result.sort((a, b) => b.price - a.price); break;
          case 'rating': result.sort((a, b) => b.rating - a.rating); break;
          case 'discount': result.sort((a, b) => b.discount - a.discount); break;
        }
      }

      if (options?.limit) result = result.slice(0, options.limit);
      return result;
    },
    findById: (id: string) => {
      let products = MOCK_PRODUCTS;
      if (typeof localStorage !== 'undefined') {
        const adminData = localStorage.getItem("admin_products");
        if (adminData) products = JSON.parse(adminData);
      }
      return products.find(p => p.id === id);
    },
  },
  categories: {
    findMany: (options?: { activeOnly?: boolean; homepageOnly?: boolean; limit?: number }) => {
      let result = MOCK_CATEGORIES;
      if (typeof localStorage !== 'undefined') {
        const adminData = localStorage.getItem("admin_categories");
        if (adminData) result = JSON.parse(adminData);
      }
      
      // Map defaults if they don't exist in older mock data
      result = result.map((c, i) => ({
         ...c,
         status: c.status || 'active',
         showOnHomepage: c.showOnHomepage !== false,
         displayOrder: c.displayOrder ?? i,
         maxProducts: c.maxProducts ?? 12
      }));

      if (options?.activeOnly) result = result.filter(c => c.status === 'active');
      if (options?.homepageOnly) result = result.filter(c => c.showOnHomepage);
      if (options?.limit) result = result.slice(0, options.limit);
      
      result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      return result;
    },
    findBySlug: (slug: string) => DB.categories.findMany().find(c => c.slug === slug),
    findById: (id: string) => DB.categories.findMany().find(c => c.id === id),
  },
  subcategories: {
    findMany: (categoryId?: string) => categoryId ? MOCK_SUBCATEGORIES.filter(s => s.categoryId === categoryId) : MOCK_SUBCATEGORIES,
  },
  brands: {
    findMany: () => MOCK_BRANDS,
    findById: (id: string) => MOCK_BRANDS.find(b => b.id === id),
  }
};

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  type: 'main' | 'godown' | 'cold_storage';
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface InventoryItem {
  id: string; 
  productId: string;
  productName: string;
  productImage?: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId?: string;
  supplierId?: string;
  warehouseId: string;
  
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  
  buyingPrice: number;
  sellingPrice: number;
  inventoryValue: number; 
  
  expiryDate?: string;
  status: 'healthy' | 'low_stock' | 'out_of_stock' | 'incoming';
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  warehouseId: string;
  previousQuantity: number;
  newQuantity: number;
  difference: number;
  reason: 'sold' | 'added' | 'damaged' | 'expired' | 'returned' | 'lost' | 'manual_adjustment' | 'transfer';
  notes?: string;
  adminName: string;
  createdAt: string;
}

