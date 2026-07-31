import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

const SLIDES = [
  {
    id: 1,
    title: "Fresh Fruits & Vegetables",
    subtitle: "Freshness Delivered Daily",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    cta: "Shop Fresh",
    link: "/category/vegetables-fruits",
    bgColor: "from-emerald-900/80 to-emerald-900/20"
  },
  {
    id: 2,
    title: "Dairy & Breakfast",
    subtitle: "Start Your Day Fresh",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1200&q=80",
    cta: "Explore Dairy",
    link: "/category/dairy-breakfast",
    bgColor: "from-blue-900/80 to-blue-900/20"
  },
  {
    id: 3,
    title: "Weekend Mega Deals",
    subtitle: "Save More This Weekend",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
    cta: "View Deals",
    link: "/products",
    bgColor: "from-amber-900/80 to-amber-900/20"
  },
  {
    id: 4,
    title: "Snacks & Beverages",
    subtitle: "Cravings Delivered Fast",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=1200&q=80",
    cta: "Get Snacks",
    link: "/category/munchies",
    bgColor: "from-rose-900/80 to-rose-900/20"
  },
  {
    id: 5,
    title: "Daily Essentials",
    subtitle: "Everything You Need, Minutes Away",
    image: "https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=1200&q=80",
    cta: "Shop Essentials",
    link: "/category/atta-rice-dal",
    bgColor: "from-slate-900/80 to-slate-900/20"
  }
];

export function PromoCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative mx-auto max-w-[1750px] w-[96%] px-4 sm:px-6 group my-12">
      <div className="overflow-hidden rounded-[24px] md:rounded-[32px] shadow-xl relative bg-slate-100" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {SLIDES.map((slide, index) => (
            <div 
              key={slide.id} 
              className="relative flex-[0_0_100%] min-w-0 h-[300px] md:h-[400px] lg:h-[460px] overflow-hidden"
            >
              {/* Background Image */}
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="absolute inset-0 w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
              />
              
              {/* Gradient Overlay for Readability */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} mix-blend-multiply opacity-90`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Content */}
              <div className="absolute inset-0 z-10 flex flex-col justify-center p-8 md:p-16 lg:p-20 max-w-3xl">
                <div className="overflow-hidden mb-3">
                  <span className="inline-block text-white/90 text-sm md:text-base lg:text-lg font-bold tracking-widest uppercase">
                    {slide.title}
                  </span>
                </div>
                <div className="overflow-hidden mb-8">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                    {slide.subtitle}
                  </h2>
                </div>
                
                <div>
                  <Link 
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-white text-[#2C2C2E] px-6 py-3 md:px-8 md:py-4 rounded-full font-bold text-sm md:text-base transition-transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    {slide.cta} <ArrowRight className="size-4 md:size-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows (Hidden on mobile, visible on hover on desktop) */}
      <button 
        onClick={scrollPrev}
        className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40 hidden md:flex"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button 
        onClick={scrollNext}
        className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-20 size-10 md:size-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40 hidden md:flex"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Pagination Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-500 rounded-full ${
              selectedIndex === index 
                ? "w-8 h-2 md:w-10 md:h-2.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                : "w-2 h-2 md:w-2.5 md:h-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
