import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, TrendingUp } from 'lucide-react';
import { DB } from '@/lib/enterprise-data';
import { AutoCarousel } from './ui/auto-carousel';

// Helper function to provide clean, short examples for categories
const getCategoryExamples = (name: string) => {
  const map: Record<string, string> = {
    "Dairy & Eggs": "Milk • Cheese • Butter",
    "Fresh Fruits": "Apples • Bananas • Mangoes",
    "Fresh Vegetables": "Tomatoes • Potatoes • Onions",
    "Bakery": "Bread • Cakes • Cookies",
    "Rice, Atta & Dal": "Rice • Wheat Flour • Lentils",
    "Tea & Coffee": "Tea • Coffee • Green Tea",
    "Snacks": "Chips • Biscuits • Namkeen",
    "Meat & Seafood": "Chicken • Fish • Mutton",
    "Personal Care": "Soap • Shampoo • Lotion"
  };
  
  return map[name] || "Fresh • Quality • Premium";
};

export function PremiumCategoryCarousel() {
  const categories = DB.categories.findMany();

  const getProductCount = (categoryId: string) => {
    return DB.products.findMany({ categoryId }).length;
  };

  return (
    <section className="relative w-full py-12 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2C2C2E] flex items-center gap-2">
              <span className="text-2xl">🛒</span> Shop by Category
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link 
              to="/products" 
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View All 
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carousel */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } }
          }}
        >
          <AutoCarousel
            paginationId="activePill-Categories"
            viewportClassName="-mx-4 px-4 pb-4 pt-4"
            containerClassName="gap-4 md:gap-5"
            options={{ dragFree: true, containScroll: 'trimSnaps' }}
            hideArrows={true} // Categories typically scroll freely without floating arrows
          >
            {categories.map((category, index) => {
              const productCount = getProductCount(category.id);
              const examples = getCategoryExamples(category.name);
              
              const isBestSeller = index === 0 || index === 4;
              const isTrending = index === 2 || index === 7;
              
              return (
                <div 
                  key={category.id} 
                  className="flex-[0_0_150px] md:flex-[0_0_170px] lg:flex-[0_0_180px] min-w-0 shrink-0"
                >
                  <div className="h-full">
                    <Link
                      to="/category/$slug"
                      params={{ slug: category.slug }}
                      className="group relative block w-full h-[230px] bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-10px_rgba(16,185,129,0.4)] transition-all duration-300 outline-none flex flex-col items-center p-4 hover:-translate-y-2 hover:scale-[1.04] hover:border-emerald-200"
                    >
                      {/* Optional Badge */}
                      {isBestSeller && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white">
                          <Flame className="size-2.5 fill-current" /> Best Seller
                        </div>
                      )}
                      {isTrending && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white">
                          <TrendingUp className="size-2.5" /> Trending
                        </div>
                      )}

                      {/* Large Centered Image Container */}
                      <div className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] lg:w-[100px] lg:h-[100px] rounded-full bg-slate-50 flex items-center justify-center mb-3 overflow-hidden transition-all duration-500 relative z-10 shrink-0 shadow-sm ring-1 ring-slate-50 group-hover:ring-emerald-100">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80";
                          }}
                        />
                      </div>

                      {/* Text Section */}
                      <div className="text-center w-full relative z-10 flex flex-col flex-1 items-center">
                        <h3 className="text-[14px] md:text-[15px] font-semibold text-[#2C2C2E] line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {category.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                          <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                          <p className="text-[11px] font-bold text-slate-500">
                            {productCount} Items
                          </p>
                        </div>

                        {/* Popular Products Row */}
                        <p className="text-[10px] font-medium text-slate-400/90 leading-tight line-clamp-2 px-1">
                          {examples}
                        </p>
                        
                        {/* Hover Explore Action (Slides in) */}
                        <div className="absolute bottom-4 left-0 right-0 overflow-hidden flex justify-center items-center h-0 opacity-0 group-hover:h-[24px] group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 bg-white shadow-[-10px_-10px_20px_white]">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
                            Explore <ArrowRight className="size-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </AutoCarousel>
        </motion.div>
      </div>
    </section>
  );
}

