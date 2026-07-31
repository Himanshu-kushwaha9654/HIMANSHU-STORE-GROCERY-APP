import React from 'react';
import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { DB } from '@/lib/enterprise-data';

export function CategoryBentoGrid() {
  const categories = DB.categories.findMany();
  
  const getProductCount = (categoryId: string) => {
    return DB.products.findMany({ categoryId }).length;
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <section className="relative w-full py-20 bg-slate-50 overflow-hidden">
      {/* Background Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/50 text-emerald-700 font-semibold text-xs mb-4 border border-emerald-200/50">
              <Sparkles className="w-3.5 h-3.5" />
              Bento Showcase
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2E] mb-2">
              Explore Departments
            </h2>
            <p className="text-lg text-slate-500 font-medium max-w-2xl">
              Curated categories designed for the modern grocery experience. Discover fresh produce, dairy, and daily essentials.
            </p>
          </div>
          <Link 
            to="/products" 
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sm font-bold text-[#2C2C2E] hover:text-emerald-600 shadow-sm border border-slate-200 hover:border-emerald-200 transition-all"
          >
            View All 
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((category, index) => {
            const productCount = getProductCount(category.id);
            
            // Determine Bento Grid classes based on index
            let bentoClass = "col-span-1 row-span-1 min-h-[220px] md:min-h-[260px]";
            if (index === 0) {
              bentoClass = "col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-[300px] lg:min-h-[544px]"; // Large square
            } else if (index === 1) {
              bentoClass = "col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 min-h-[240px] lg:min-h-[260px]"; // Wide rectangle
            } else if (index === 2 || index === 3) {
              bentoClass = "col-span-1 lg:col-span-1 lg:row-span-1 min-h-[240px] lg:min-h-[260px]"; // Standard squares
            }

            return (
              <motion.div
                key={category.id}
                variants={itemVariants}
                className={bentoClass}
              >
                <Link
                  to="/category/$slug"
                  params={{ slug: category.slug }}
                  className="block group relative w-full h-full rounded-[28px] overflow-hidden outline-none bg-slate-200"
                >
                  {/* Background Image */}
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  {/* Dark Gradient Overlay for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-emerald-950/90 transition-colors duration-500" />
                  
                  {/* Glowing Border effect */}
                  <div className="absolute inset-0 rounded-[28px] border-2 border-white/10 group-hover:border-emerald-400/50 transition-colors duration-500 z-20 pointer-events-none" />

                  {/* Card Content */}
                  <div className="absolute inset-0 z-10 p-6 md:p-8 flex flex-col justify-between h-full">
                    
                    {/* Top Badges */}
                    <div className="flex justify-between items-start w-full">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md shadow-sm border border-white/30 flex items-center justify-center text-xl">
                        {category.icon || "🥑"}
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white font-bold text-xs tracking-wide">
                        {productCount} Items
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="w-full">
                      <h3 className={`font-bold text-white mb-2 leading-tight ${index === 0 ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl'}`}>
                        {category.name}
                      </h3>
                      
                      {/* Animated Explore Button */}
                      <div className="overflow-hidden h-0 group-hover:h-[40px] opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out mt-4">
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                          Explore Category <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

