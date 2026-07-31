import React from 'react';
import { ProductCard } from './product-card';
import type { Product } from '@/lib/enterprise-data';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { AutoCarousel } from './ui/auto-carousel';

interface RecommendationCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
}

export function RecommendationCarousel({ 
  title, 
  subtitle = "Personalized picks based on your interests.", 
  products, 
  isLoading = false
}: RecommendationCarouselProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="w-full py-12 relative">
        <div className="flex flex-col mb-8 px-4 md:px-8">
          <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
        <div className="flex gap-4 px-4 md:px-8 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] min-w-0">
              <div className="h-[400px] bg-slate-100 rounded-[24px] animate-pulse border border-slate-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty State
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-slate-50 rounded-[32px] border border-slate-100 shadow-inner my-12 mx-auto max-w-5xl">
        <div className="w-24 h-24 mb-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
          <ShoppingBag className="size-10" />
        </div>
        <h3 className="text-2xl font-semibold text-[#2C2C2E] mb-2">{title}</h3>
        <p className="text-slate-500 font-medium mb-8 max-w-md">
          Start exploring products and we'll personalize recommendations for you.
        </p>
        <Link 
          to="/products"
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full py-12 relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-4 md:px-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2C2C2E] mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-500 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/recommendations" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors hidden md:block">
            View All
          </Link>
        </div>
      </div>

      {/* Carousel */}
      <AutoCarousel
        paginationId={`activePill-${title.replace(/\\s+/g, '-')}`}
        viewportClassName="px-4 md:px-8 pb-8 -mx-4 md:-mx-8"
        containerClassName="-ml-4 md:-ml-6"
        options={{
          slidesToScroll: 2,
          breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 3 },
            '(min-width: 1024px)': { slidesToScroll: 4 }
          }
        }}
      >
        {products.map((product, index) => (
          <div
            key={`${product.id}-${index}`}
            className="flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-4 md:pl-6"
          >
            <div className="h-full">
              <ProductCard product={product} />
            </div>
          </div>
        ))}
      </AutoCarousel>
    </motion.div>
  );
}

