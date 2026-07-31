import { DB, type Product } from './enterprise-data';
import { useRecentlyViewed } from './recently-viewed-store';

export const RecommendationEngine = {
  getFallbackProducts: (limit: number = 10): Product[] => {
    // Intelligent fallback: mix of highly rated and discounted
    const all = DB.products.findMany({ sortBy: 'rating' });
    const fallback = all.filter(p => p.reviews > 10 || p.discount > 0);
    if (fallback.length === 0) return all.slice(0, limit);
    return fallback.slice(0, limit);
  },

  padWithFallbacks: (results: Product[], limit: number): Product[] => {
    if (results.length >= limit) return results.slice(0, limit);
    const fallbacks = RecommendationEngine.getFallbackProducts(limit * 2);
    const missing = limit - results.length;
    const toAdd = fallbacks.filter(f => !results.some(r => r.id === f.id)).slice(0, missing);
    return [...results, ...toAdd];
  },

  getFrequentlyBoughtTogether: (currentProduct: Product, limit: number = 6): Product[] => {
    let related = DB.products.findMany({ 
      categoryId: currentProduct.categoryId,
      sortBy: 'rating'
    }).filter(p => p.id !== currentProduct.id);

    const complementary = related.filter(p => p.subcategoryId !== currentProduct.subcategoryId);
    let results = [...complementary, ...related];
    results = Array.from(new Set(results.map(p => p.id))).map(id => results.find(p => p.id === id)!);
    
    return RecommendationEngine.padWithFallbacks(results, limit);
  },

  getCustomersAlsoBought: (currentProduct: Product, limit: number = 6): Product[] => {
    let results = DB.products.findMany({
      subcategoryId: currentProduct.subcategoryId,
      sortBy: 'rating'
    }).filter(p => p.id !== currentProduct.id && p.brandId !== currentProduct.brandId);

    return RecommendationEngine.padWithFallbacks(results, limit);
  },

  getInspiredByBrowsing: (limit: number = 10): Product[] => {
    const recentlyViewedIds = useRecentlyViewed.getState().items;
    
    // Fallback if no history
    if (!recentlyViewedIds || recentlyViewedIds.length === 0) {
      return RecommendationEngine.getFallbackProducts(limit);
    }

    const recentProducts = recentlyViewedIds
      .map(id => DB.products.findById(id))
      .filter((p): p is Product => p !== undefined);

    if (recentProducts.length === 0) {
      return RecommendationEngine.getFallbackProducts(limit);
    }

    const categoryCounts: Record<string, number> = {};
    recentProducts.forEach(p => {
      categoryCounts[p.categoryId] = (categoryCounts[p.categoryId] || 0) + 1;
    });

    const topCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

    let recommendations: Product[] = [];
    for (const catId of topCategories) {
      const catProducts = DB.products.findMany({ categoryId: catId, sortBy: 'rating' })
        .filter(p => !recentlyViewedIds.includes(p.id)); 
      
      recommendations.push(...catProducts);
      if (recommendations.length >= limit) break;
    }

    return RecommendationEngine.padWithFallbacks(recommendations, limit);
  },

  getTrendingNearYou: (limit: number = 10): Product[] => {
    let results = DB.products.findMany({ sortBy: 'rating' }).filter(p => p.reviews > 20);
    return RecommendationEngine.padWithFallbacks(results, limit);
  },

  getSeasonalPicks: (limit: number = 10): Product[] => {
    let results = DB.products.findMany({ hasOffers: true, sortBy: 'discount' });
    return RecommendationEngine.padWithFallbacks(results, limit);
  },

  getNewArrivals: (limit: number = 10): Product[] => {
    let results = [...DB.products.findMany()].reverse().filter(p => p.isOrganic);
    return RecommendationEngine.padWithFallbacks(results, limit);
  }
};
