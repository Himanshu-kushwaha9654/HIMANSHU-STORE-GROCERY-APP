import React, { useCallback, useEffect, useState, useRef, ReactNode } from 'react';
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PremiumCarouselProps<T> {
  /** The data array to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Whether the carousel should auto-play. Default: false */
  autoPlay?: boolean;
  /** Interval in ms for autoplay. Default: 4000 */
  autoPlayInterval?: number;
  /** Whether the carousel should infinitely loop. Default: true */
  infiniteLoop?: boolean;
  /** Whether to show the navigation arrows. Default: true */
  showArrows?: boolean;
  /** Whether to show pagination dots. Default: true */
  showPagination?: boolean;
  /** Optional Title for the Carousel Section */
  title?: ReactNode;
  /** Optional Subtitle */
  subtitle?: string;
  /** Optional action area next to title (e.g. View All link) */
  headerAction?: ReactNode;
  /** Optional classname for the outer container */
  className?: string;
  /** Optional classname for the viewport */
  viewportClassName?: string;
  /** Optional classname for the flex container holding the items */
  containerClassName?: string;
  /** Embla options override */
  options?: EmblaOptionsType;
  /** A unique ID for Framer Motion shared layout animations on the pagination dots */
  paginationId?: string;
}

export function PremiumCarousel<T>({ 
  items,
  renderItem,
  autoPlay = false,
  autoPlayInterval = 4000,
  infiniteLoop = true,
  showArrows = true,
  showPagination = true,
  title,
  subtitle,
  headerAction,
  className,
  viewportClassName,
  containerClassName,
  options = {},
  paginationId = "premiumCarouselPill"
}: PremiumCarouselProps<T>) {
  
  // 1. Viewport tracking for intelligent autoplay
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: '50px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Embla initialization with Wheel Gestures & Autoplay
  const plugins = React.useMemo(() => {
    const p: any[] = [WheelGesturesPlugin()];
    if (autoPlay) {
      p.push(Autoplay({ delay: autoPlayInterval, stopOnInteraction: false, stopOnMouseEnter: true }));
    }
    return p;
  }, [autoPlay, autoPlayInterval]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: infiniteLoop, 
      align: 'start', 
      skipSnaps: false,
      dragFree: true, // Native swipe feel
      containScroll: 'trimSnaps',
      ...options 
    }, 
    plugins
  );

  // 3. Pause/Play logic based on viewport
  useEffect(() => {
    if (!emblaApi || !autoPlay) return;
    const autoplayPlugin = emblaApi.plugins().autoplay;
    if (!autoplayPlugin) return;
    
    if (isInView) {
      autoplayPlugin.play();
    } else {
      autoplayPlugin.stop();
    }
  }, [emblaApi, isInView, autoPlay]);

  // 4. Navigation & Pagination State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      ref={sectionRef}
      className={cn("relative group/premium-carousel w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Area */}
      {(title || subtitle || headerAction) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 px-4 md:px-8 gap-4">
          <div>
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2C2C2E] flex items-center gap-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center gap-4">
              {headerAction}
            </div>
          )}
        </div>
      )}

      <div className={cn("overflow-hidden", viewportClassName)} ref={emblaRef}>
        <div className={cn("flex", containerClassName)}>
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>

      {/* Floating Navigation Arrows */}
      {showArrows && (
        <AnimatePresence>
          {isHovered && canScrollPrev && (
            <motion.button 
              key="prev-btn"
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={scrollPrev}
              className={cn(
                "absolute top-[45%] -translate-y-1/2 left-0 md:-left-4 z-10 flex size-12 place-items-center justify-center rounded-full bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all",
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-6" />
            </motion.button>
          )}
          
          {isHovered && canScrollNext && (
            <motion.button 
              key="next-btn"
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={scrollNext}
              className={cn(
                "absolute top-[45%] -translate-y-1/2 right-0 md:-right-4 z-10 flex size-12 place-items-center justify-center rounded-full bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-100 hover:shadow-[0_8px_30px_rgb(16,185,129,0.2)] transition-all",
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="size-6" />
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Pagination Dots */}
      {showPagination && scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-5 px-4 h-6">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                scrollTo(index);
                if (autoPlay) {
                  const autoplayPlugin = emblaApi?.plugins().autoplay;
                  if (autoplayPlugin) autoplayPlugin.reset();
                }
              }}
              className="group relative flex items-center justify-center p-2 -m-2 outline-none cursor-pointer"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? "true" : "false"}
            >
              {index === selectedIndex ? (
                <motion.div
                  layoutId={paginationId}
                  className="h-1.5 w-6 bg-emerald-500 rounded-full shadow-sm z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              ) : (
                <span className="block w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 group-hover:scale-125 transition-all duration-300 ease-out" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
