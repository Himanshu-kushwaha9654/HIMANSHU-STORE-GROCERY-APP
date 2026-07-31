import { useState, useEffect, useRef } from "react";

export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        // Once it's in view, we usually want to keep it rendered
        // If we want to unmount on scroll out, we can toggle this, but for lazy loading we disconnect.
        observer.disconnect();
      }
    }, {
      rootMargin: "200px", // Load slightly before it enters the viewport
      ...options
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isInView };
}
