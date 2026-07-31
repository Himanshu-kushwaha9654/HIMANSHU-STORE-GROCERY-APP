import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSearchStore } from "@/lib/search-store";

export function FloatingAiButton() {
  const { isAiShoppingOpen, setIsAiShoppingOpen } = useSearchStore();

  return (
    <AnimatePresence>
      {!isAiShoppingOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 50, transition: { duration: 0.2 } }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="fixed bottom-6 right-6 z-[100] sm:bottom-8 sm:right-8"
        >
          <motion.button
            onClick={() => setIsAiShoppingOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex size-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl overflow-hidden ring-4 ring-white/50 backdrop-blur-md sm:size-16"
            style={{ willChange: "transform" }}
          >
            {/* Animated Gradient Background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-90"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{ backgroundSize: "200% 200%" }}
            />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
            
            {/* Inner Glow */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]" />

            {/* Icon */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 3,
                ease: "easeInOut"
              }}
              className="relative z-10 drop-shadow-md"
            >
              <Sparkles className="size-6 sm:size-7" strokeWidth={2.5} />
            </motion.div>
            
            {/* Ping effect behind the button */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-white opacity-20"
              animate={{
                scale: [1, 1.5],
                opacity: [0.2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
