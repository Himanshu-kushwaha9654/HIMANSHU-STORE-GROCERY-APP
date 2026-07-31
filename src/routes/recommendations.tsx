import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { RecommendationEngine } from '@/lib/recommendation-engine';
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";

export const Route = createFileRoute('/recommendations')({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const goBack = useNavigateBack();
  const inspired = RecommendationEngine.getInspiredByBrowsing(12);
  const trending = RecommendationEngine.getTrendingNearYou(20);

  // Combine and deduplicate
  const allRecommendations = [...inspired, ...trending];
  const uniqueRecommendations = Array.from(new Set(allRecommendations.map(p => p.id)))
    .map(id => allRecommendations.find(p => p.id === id)!);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button onClick={() => goBack("/")} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-600 transition-colors mb-6">
              <ArrowLeft className="size-4" /> Back to Shopping
            </button>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#2C2C2E] flex items-center gap-4">
              Your Recommendations
              <div className="bg-amber-100 text-amber-500 rounded-full p-2">
                <Sparkles className="size-6 text-amber-500" />
              </div>
            </h1>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl">
              We've curated these personalized picks just for you, based on your browsing history, 
              local trends, and what's popular right now.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {uniqueRecommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

