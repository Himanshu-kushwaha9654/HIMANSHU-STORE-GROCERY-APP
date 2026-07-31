import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCursorStore } from '@/lib/cursor-store';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const { variant, text, isActive, setVariant, setText, reset, setIsActive } = useCursorStore();
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isPointer, setIsPointer] = useState(false);

  // Framer motion values for 60FPS performance
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for cursor movement
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if the device has a fine pointer (mouse) instead of touch
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsPointer(mediaQuery.matches);
    setIsActive(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsPointer(e.matches);
      setIsActive(e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, [setIsActive]);

  useEffect(() => {
    if (!isPointer || shouldReduceMotion) return;

    // We add a global class to hide the default cursor when custom cursor is active
    document.body.classList.add('custom-cursor');

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const cursorTarget = target.closest('[data-cursor]');
      const textTarget = target.closest('[data-cursor-text]');

      if (textTarget) {
        setVariant('text');
        setText(textTarget.getAttribute('data-cursor-text') || '');
      } else if (cursorTarget) {
        const type = cursorTarget.getAttribute('data-cursor');
        setVariant(type as any || 'button');
        setText('');
      } else if (target.closest('button') || target.closest('a')) {
        setVariant('button');
        setText('');
      } else {
        reset();
      }
    };

    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
      document.body.classList.remove('custom-cursor');
      reset();
    };
  }, [isPointer, shouldReduceMotion, mouseX, mouseY, setVariant, setText, reset]);

  if (!isPointer || shouldReduceMotion || !isActive) return null;

  const variants = {
    default: {
      height: 16,
      width: 16,
      backgroundColor: "rgba(16, 185, 129, 0.2)",
      border: "2px solid rgba(16, 185, 129, 0.8)",
      boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    button: {
      height: 48,
      width: 48,
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      border: "2px solid rgba(16, 185, 129, 0.5)",
      boxShadow: "0 0 25px rgba(16, 185, 129, 0.6)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    product: {
      height: 64,
      width: 64,
      backgroundColor: "rgba(0, 0, 0, 0)",
      border: "2px solid rgba(16, 185, 129, 0.4)",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    text: {
      height: 36,
      width: "auto",
      backgroundColor: "rgba(16, 185, 129, 0.95)",
      border: "none",
      boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
      padding: "0 16px",
      borderRadius: "18px",
      transition: { type: "spring", stiffness: 300, damping: 20 }
    },
    hidden: {
      opacity: 0,
      scale: 0
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: "absolute",
              left: ripple.x,
              top: ripple.y,
              x: "-50%",
              y: "-50%",
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "2px solid rgba(16, 185, 129, 0.6)",
              backgroundColor: "rgba(16, 185, 129, 0.1)"
            }}
          />
        ))}
      </AnimatePresence>

      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 flex items-center justify-center rounded-full pointer-events-none z-[10000] overflow-hidden whitespace-nowrap"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        variants={variants}
        animate={variant}
      >
        <AnimatePresence>
          {variant === 'text' && text && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-white text-xs font-bold tracking-wide"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Center Dot for precision */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-emerald-500 pointer-events-none z-[10001]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          opacity: variant === 'default' ? 1 : 0,
          scale: variant === 'default' ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
}
