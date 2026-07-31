import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expand, X } from 'lucide-react';
import { Product } from '@/lib/enterprise-data';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const images = product.images || [];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Image Stage */}
        <div 
          className="relative aspect-square overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-50/80 to-slate-100/50 border border-slate-100 group cursor-crosshair shadow-inner"
          onMouseEnter={() => setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Main Image */}
          <motion.img
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            src={images[activeIndex]}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain mix-blend-multiply p-12 transition-transform duration-200 z-10 relative will-change-transform drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
            style={
              isZooming
                ? {
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    transform: 'scale(1.8)',
                  }
                : {}
            }
          />
          
          {/* Fullscreen Trigger Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 z-30"
          >
            <Expand className="size-5" />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-2 no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 size-24 rounded-2xl overflow-hidden bg-slate-50 border-2 shadow-sm transition-all hover:-translate-y-1 p-2 ${
                  activeIndex === i ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-transparent hover:border-slate-300'
                }`}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} loading="lazy" className="w-full h-full object-contain mix-blend-multiply" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shadow-sm"
            >
              <X className="size-6" />
            </button>
            
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={images[activeIndex]}
              alt={product.name}
              className="max-w-full max-h-[75vh] object-contain drop-shadow-2xl mix-blend-multiply"
            />
            
            {images.length > 1 && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 mt-12 bg-white p-4 rounded-3xl shadow-xl border border-slate-100"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`size-20 rounded-xl overflow-hidden bg-slate-50 border-2 transition-all p-2 ${
                      activeIndex === i ? 'border-emerald-500 scale-110 shadow-lg' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
