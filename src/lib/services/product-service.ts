import { DB, Product } from "@/lib/enterprise-data";

export interface ProductFilters {
  query?: string;
  categoryIds?: string[];
  brandIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: "Popular" | "Price ↑" | "Price ↓" | "Rating" | "Discount";
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  hasMore: boolean;
  page: number;
}

export const ProductService = {
  /**
   * Simulate a backend search/filter/sort API with pagination.
   */
  async searchProducts(filters: ProductFilters): Promise<PaginatedProducts> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    let items = DB.products.findMany({ limit: 1000 });

    // 1. Text Search
    if (filters.query && filters.query.trim() !== "") {
      const q = filters.query.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          (p as any).tags?.some((t: any) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes("All")) {
        items = items.filter((p) => filters.categoryIds!.includes(p.categoryId));
      }
    }

    // 3. Brand Filter
    if (filters.brandIds && filters.brandIds.length > 0) {
      items = items.filter((p) => filters.brandIds!.includes(p.brandId));
    }

    // 4. Price Filter
    if (filters.minPrice !== undefined) {
      items = items.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= filters.maxPrice!);
    }

    // 5. Sorting
    const sort = filters.sort || "Popular";
    items.sort((a, b) => {
      switch (sort) {
        case "Price ↑":
          return a.price - b.price;
        case "Price ↓":
          return b.price - a.price;
        case "Rating":
          return (b.rating || 0) - (a.rating || 0);
        case "Discount": {
          const discountA = a.compareAt ? ((a.compareAt - a.price) / a.compareAt) : 0;
          const discountB = b.compareAt ? ((b.compareAt - b.price) / b.compareAt) : 0;
          return discountB - discountA;
        }
        case "Popular":
        default:
          return (b.reviews || 0) - (a.reviews || 0); // fallback popularity by review count
      }
    });

    const total = items.length;
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total,
      page,
      hasMore: endIndex < total,
    };
  },

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(productId: string): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = DB.products.findMany({ limit: 100 });
    // Simulate smart recommendation (pick 3 random products from the same category)
    const current = DB.products.findById(productId);
    if (!current) return [];
    
    const related = all.filter(p => p.categoryId === current.categoryId && p.id !== productId);
    return related.sort(() => 0.5 - Math.random()).slice(0, 3);
  },

  /**
   * Fetch a product by its ID
   */
  async getProductById(id: string): Promise<Product | undefined> {
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300));
    return DB.products.findById(id);
  },

  /**
   * Get related products (frequently bought together, customers also bought)
   */
  async getRelatedProducts(product: Product) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    const all = DB.products.findMany({ limit: 100 });
    
    // frequentlyBought
    const freq = all.filter(p => p.categoryId === product.categoryId && p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // customersAlsoBought
    const also = all.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);

    return {
      frequentlyBought: freq,
      customersAlsoBought: also,
      healthyAlternatives: DB.products.findMany({ 
        categoryId: product.categoryId,
        isOrganic: true,
        limit: 10
      }).filter(p => p.id !== product.id),
      similarProducts: DB.products.findMany({
        categoryId: product.categoryId,
        limit: 10
      }).filter(p => p.id !== product.id)
    };
  },

  /**
   * Fetch the brand for a given product
   */
  async getBrandById(brandId: string) {
    return DB.brands.findById(brandId);
  },

  /**
   * Generate mock reviews for a product
   */
  getMockReviews(productId: string, rating: number, count: number) {
    const reviews = [
      { id: 1, user: "Ankit S.", text: "Absolutely loved the quality. Very fresh and packaging was premium.", rating: 5, date: "2 days ago", helpful: 12 },
      { id: 2, user: "Priya M.", text: "Good product, fast delivery. Would buy again.", rating: 4, date: "1 week ago", helpful: 5 },
      { id: 3, user: "Rahul K.", text: "Decent, but expected a bit more quantity for the price.", rating: 3, date: "2 weeks ago", helpful: 2 },
      { id: 4, user: "Sneha V.", text: "Top notch quality as always from Himanshu Store.", rating: 5, date: "3 weeks ago", helpful: 18 },
    ];
    
    // Distribute rating mostly around the product's actual rating
    const distribution = {
      5: Math.floor(count * 0.6),
      4: Math.floor(count * 0.25),
      3: Math.floor(count * 0.1),
      2: Math.floor(count * 0.03),
      1: Math.floor(count * 0.02),
    };
    
    // Make sure they sum up to count (rough approx)
    const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (sum < count) {
      distribution[5] += count - sum;
    }
    
    return {
      averageRating: rating,
      totalReviews: count,
      distribution,
      recentReviews: reviews
    };
  }
};
