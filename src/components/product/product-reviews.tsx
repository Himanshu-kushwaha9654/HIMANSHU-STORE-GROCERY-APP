import { Star, ThumbsUp, CheckCircle2 } from "lucide-react";
import { ProductService } from "@/lib/services/product-service";
import { motion } from "framer-motion";

interface ProductReviewsProps {
  productId: string;
  rating: number;
  count: number;
}

export function ProductReviews({ productId, rating, count }: ProductReviewsProps) {
  const reviewsData = ProductService.getMockReviews(productId, rating, count);

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-12">
      {/* Left: Summary */}
      <div className="flex flex-col">
        <div className="text-center bg-slate-50 p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <div className="text-5xl font-bold text-[#2C2C2E] mb-2">{reviewsData.averageRating.toFixed(1)}</div>
          <div className="flex justify-center gap-1 mb-2 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`size-5 ${star <= Math.round(reviewsData.averageRating) ? 'fill-current' : 'text-slate-300'}`} />
            ))}
          </div>
          <div className="text-sm font-medium text-slate-500">
            Based on {reviewsData.totalReviews} reviews
          </div>
        </div>

        {/* Distribution */}
        <div className="mt-8 flex flex-col gap-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviewsData.distribution[star as keyof typeof reviewsData.distribution] || 0;
            const percentage = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 text-sm font-medium text-slate-600">
                  {star} <Star className="size-3 fill-current text-amber-500" />
                </div>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <div className="w-10 text-right text-xs font-medium text-slate-400">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Review List */}
      <div className="flex flex-col gap-6">
        <h3 className="text-xl font-bold text-[#2C2C2E]">Recent Reviews</h3>
        
        {reviewsData.recentReviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[24px] bg-white border border-slate-100 shadow-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold uppercase">
                  {review.user.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#2C2C2E] flex items-center gap-2">
                    {review.user}
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="size-3" /> Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{review.date}</div>
                </div>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-current' : 'text-slate-200'}`} />
                ))}
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed">
              {review.text}
            </p>
            
            <div className="flex items-center gap-4 mt-2">
              <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-emerald-600 transition-colors">
                <ThumbsUp className="size-4" /> Helpful ({review.helpful})
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
