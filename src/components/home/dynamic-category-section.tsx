import React, { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Category, DB } from "@/lib/enterprise-data";
import { useInView } from "@/lib/hooks/use-in-view";
import { PremiumCarousel } from "@/components/ui/premium-carousel";
import { ProductCard } from "@/components/product-card";

interface DynamicCategorySectionProps {
  category: Category;
}

export function DynamicCategorySection({ category }: DynamicCategorySectionProps) {
  const { ref, isInView } = useInView({ rootMargin: "400px" });

  const products = useMemo(() => {
    if (!isInView) return [];
    return DB.products.findMany({ 
      categoryId: category.id, 
      limit: category.maxProductsDisplay || 12 
    });
  }, [isInView, category.id, category.maxProductsDisplay]);

  // If we are in view and there are no products, we don't render the carousel
  if (isInView && products.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="w-full min-h-[300px]">
      {isInView ? (
        <PremiumCarousel
          title={category.name}
          subtitle={category.subtitle}
          headerAction={
            <Link 
              to="/category/$slug" 
              params={{ slug: category.slug }}
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View All <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          }
          items={products}
          autoPlay={false}
          viewportClassName="px-4 md:px-8 pb-8 -mx-4 md:-mx-8"
          containerClassName="-ml-4 md:-ml-6"
          options={{ 
            slidesToScroll: 2, 
            breakpoints: { 
              '(min-width: 768px)': { slidesToScroll: 3 }, 
              '(min-width: 1024px)': { slidesToScroll: 4 } 
            } 
          }}
          renderItem={(product, index) => (
            <div key={`${product.id}-${index}`} className="flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_20%] min-w-0 pl-4 md:pl-6">
              <div className="h-full">
                <ProductCard product={product} />
              </div>
            </div>
          )}
        />
      ) : (
        // Skeleton placeholder while waiting to scroll into view
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6 ml-4 md:ml-8" />
          <div className="flex gap-4 overflow-hidden px-4 md:px-8">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_20%] h-[300px] bg-slate-100 rounded-[24px]" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
