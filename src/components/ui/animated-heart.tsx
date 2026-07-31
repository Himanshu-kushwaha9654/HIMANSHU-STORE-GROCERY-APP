import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-store';
import { toast } from 'sonner';

interface AnimatedHeartProps {
  productId: string;
  className?: string;
  withBurst?: boolean;
}

// Helper for generating particles
const generateParticles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    angle: (i * 360) / count,
    distance: 20 + Math.random() * 20,
    size: 2 + Math.random() * 3,
  }));
};

export function AnimatedHeart({ productId, className = "", withBurst = true }: AnimatedHeartProps) {
  const isSaved = useWishlist((s) => s.has(productId));
  const toggle = useWishlist((s) => s.toggle);
  
  const particles = generateParticles(8);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle triggers an async action under the hood, but it's optimistically updated.
    toggle(productId);
    
    if (!isSaved) {
      toast.success('Saved to wishlist');
    } else {
      toast.info('Removed from wishlist');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center group ${className}`}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <AnimatePresence>
        {isSaved && withBurst && (
          <>
            {/* Soft Glow */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-rose-400 mix-blend-screen pointer-events-none"
            />
            {/* Burst Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0, 
                  opacity: 1 
                }}
                animate={{ 
                  x: Math.cos((p.angle * Math.PI) / 180) * p.distance, 
                  y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
                  scale: 1, 
                  opacity: 0 
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={isSaved ? { scale: [1, 1.4, 1] } : { scale: [1, 0.8, 1] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart 
          className={`size-5 transition-colors duration-200 ${isSaved ? 'fill-rose-500 text-rose-500 drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)]' : 'text-slate-400 group-hover:text-rose-500'}`} 
        />
      </motion.div>
    </button>
  );
}
