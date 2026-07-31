import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel, { EmblaOptionsType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AutoCarouselProps {
  children: React.ReactNode;
  options?: EmblaOptionsType;
  viewportClassName?: string;
  containerClassName?: string;
  paginationId?: string;
}

export function AutoCarousel({
  children,
  options = {},
  viewportClassName,
  containerClassName,
  paginationId = 'carousel-pagination',
}: AutoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', ...options },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="relative w-full">
      <div className={cn("overflow-hidden", viewportClassName)} ref={emblaRef}>
        <div className={cn("flex", containerClassName)}>
          {children}
        </div>
      </div>

      {scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                scrollTo(index);
                const autoplay = emblaApi?.plugins().autoplay;
                if (autoplay) autoplay.reset();
              }}
              className="group relative flex items-center justify-center p-2 -m-2 outline-none"
            >
              {index === selectedIndex ? (
                <motion.div
                  layoutId={paginationId}
                  className="h-1.5 w-6 bg-emerald-500 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              ) : (
                <span className="block w-1.5 h-1.5 rounded-full bg-slate-300" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
