import { DB, Product, Category, Brand } from "./enterprise-data";

export interface SearchFilters {
  maxPrice?: number;
  minPrice?: number;
  isOrganic?: boolean;
  fastDelivery?: boolean;
  hasOffers?: boolean;
  highProtein?: boolean;
  lowSugar?: boolean;
  categoryId?: string;
  brandId?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount';
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suggestions: string[];
  appliedFilters: SearchFilters;
  parsedQuery: string;
}

export class SearchService {
  /**
   * Mock NLP Parser: Extracts intent from a natural language query.
   * e.g., "organic milk under 100" -> { cleanQuery: "milk", filters: { isOrganic: true, maxPrice: 100 } }
   */
  static parseQuery(rawQuery: string): { cleanQuery: string; filters: SearchFilters } {
    let cleanQuery = rawQuery.toLowerCase().trim();
    const filters: SearchFilters = {};

    // 1. Price extraction (e.g. "under 100", "below 50")
    const maxPriceMatch = cleanQuery.match(/(?:under|below|less than|max)\s*(?:rs|inr|₹)?\s*(\d+)/i);
    if (maxPriceMatch && maxPriceMatch[1]) {
      filters.maxPrice = parseInt(maxPriceMatch[1], 10);
      cleanQuery = cleanQuery.replace(maxPriceMatch[0], '').trim();
    }

    const minPriceMatch = cleanQuery.match(/(?:over|above|more than|min)\s*(?:rs|inr|₹)?\s*(\d+)/i);
    if (minPriceMatch && minPriceMatch[1]) {
      filters.minPrice = parseInt(minPriceMatch[1], 10);
      cleanQuery = cleanQuery.replace(minPriceMatch[0], '').trim();
    }

    // 2. Attribute extraction
    if (cleanQuery.includes('organic')) {
      filters.isOrganic = true;
      cleanQuery = cleanQuery.replace('organic', '').trim();
    }

    if (cleanQuery.includes('offer') || cleanQuery.includes('discount') || cleanQuery.includes('sale')) {
      filters.hasOffers = true;
      cleanQuery = cleanQuery.replace(/(offer|discount|sale)s?/g, '').trim();
    }

    if (cleanQuery.match(/(fast|quick|10 min|8 min|instant)/i)) {
      filters.fastDelivery = true;
      cleanQuery = cleanQuery.replace(/(fast|quick|10 min|8 min|instant)/i, '').trim();
    }

    if (cleanQuery.includes('protein')) {
      filters.highProtein = true;
      cleanQuery = cleanQuery.replace(/high\s+protein|protein/g, '').trim();
    }

    if (cleanQuery.includes('sugar free') || cleanQuery.includes('low sugar') || cleanQuery.match(/no\s+sugar/i)) {
      filters.lowSugar = true;
      cleanQuery = cleanQuery.replace(/sugar\s*free|low\s*sugar|no\s*sugar/g, '').trim();
    }

    // Clean up extra spaces
    cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

    return { cleanQuery, filters };
  }

  /**
   * Performs a smart search simulating a backend AI search engine.
   */
  static async search(rawQuery: string, manualFilters?: SearchFilters): Promise<SearchResult> {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 150));

    if (!rawQuery.trim() && !manualFilters) {
      return {
        products: [],
        categories: [],
        brands: [],
        suggestions: [],
        appliedFilters: {},
        parsedQuery: ""
      };
    }

    const { cleanQuery, filters: nlpFilters } = this.parseQuery(rawQuery);
    
    // Merge manual filters over NLP filters
    const finalFilters = { ...nlpFilters, ...manualFilters };

    const allProducts = DB.products.findMany();
    
    // Filter Products
    let products = allProducts.filter(p => {
      // 1. Text Match (Name, Brand, SKU, Description)
      if (cleanQuery) {
        const searchableText = `${p.name} ${p.description} ${p.brandId} ${p.sku} ${p.barcode}`.toLowerCase();
        // Allow fuzzy matching on multiple words
        const words = cleanQuery.split(' ').filter(w => w.length > 0);
        const matchesText = words.length > 0 ? words.every(w => searchableText.includes(w)) : true;
        if (!matchesText) return false;
      }

      // 2. Apply Filters
      if (finalFilters.maxPrice && p.price > finalFilters.maxPrice) return false;
      if (finalFilters.minPrice && p.price < finalFilters.minPrice) return false;
      if (finalFilters.isOrganic && !p.isOrganic) return false;
      if (finalFilters.hasOffers && p.discount === 0) return false;
      if (finalFilters.fastDelivery && !p.deliveryTime.includes('min')) return false;
      if (finalFilters.categoryId && p.categoryId !== finalFilters.categoryId) return false;
      if (finalFilters.brandId && p.brandId !== finalFilters.brandId) return false;
      
      // Mock NLP trait filters
      if (finalFilters.highProtein && !p.description.toLowerCase().includes('protein')) return false;
      if (finalFilters.lowSugar && !p.description.toLowerCase().includes('sugar')) return false; 

      return true;
    });

    // Apply Sorting
    if (finalFilters.sortBy) {
      switch (finalFilters.sortBy) {
        case 'price_asc': products.sort((a, b) => a.price - b.price); break;
        case 'price_desc': products.sort((a, b) => b.price - a.price); break;
        case 'rating': products.sort((a, b) => b.rating - a.rating); break;
        case 'discount': products.sort((a, b) => b.discount - a.discount); break;
      }
    } else {
      // Default relevance (items with offers or better ratings float up)
      products.sort((a, b) => b.rating - a.rating);
    }

    // Find matching categories
    const categories = DB.categories.findMany().filter(c => 
      cleanQuery && c.name.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);

    // Find matching brands
    const brands = DB.brands.findMany().filter(b => 
      cleanQuery && b.name.toLowerCase().includes(cleanQuery)
    ).slice(0, 4);

    // Generate dynamic suggestions based on the query
    const suggestions: string[] = [];
    if (cleanQuery.length > 2) {
      suggestions.push(`${cleanQuery} in offers`);
      suggestions.push(`fresh ${cleanQuery}`);
      if (!finalFilters.isOrganic) suggestions.push(`organic ${cleanQuery}`);
      if (!finalFilters.fastDelivery) suggestions.push(`${cleanQuery} 10 min delivery`);
    }

    return {
      products: products.slice(0, 20), // Max 20 results for instant search
      categories,
      brands,
      suggestions: suggestions.slice(0, 4),
      appliedFilters: finalFilters,
      parsedQuery: cleanQuery
    };
  }

  static getPopularSearches() {
    return ["Milk", "Bread", "Eggs", "Paneer", "Amul Butter", "Chips", "Cold Drink"];
  }
}
