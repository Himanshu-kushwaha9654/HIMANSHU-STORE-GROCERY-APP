import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, RefreshCcw } from "lucide-react";
import { useNetworkStore } from "@/lib/network-store";

export function OfflineOverlay() {
  const { isOnline, initialize } = useNetworkStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
  }, [initialize]);

  useEffect(() => {
    if (!isOnline) {
      // Small delay to prevent flashing on quick reconnects
      const timer = setTimeout(() => setShowOverlay(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
      setIsRetrying(false);
    }
  }, [isOnline]);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulating a network check. In reality, the browser fires the "online" event automatically.
    setTimeout(() => {
      if (!navigator.onLine) {
        setIsRetrying(false);
      }
    }, 1500);
  };

  return (
    <AnimatePresence>
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-3xl flex flex-col items-center justify-center p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.1 }}
            className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px]" />

            {/* Illustration Container */}
            <div className="relative mb-8 mt-4">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center shadow-inner border border-rose-100">
                  <WifiOff className="size-10 text-rose-500" />
                </div>
              </motion.div>
              
              {/* Pulse rings */}
              <motion.div
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 bg-rose-400 rounded-full z-0"
              />
              <motion.div
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                className="absolute inset-0 bg-rose-300 rounded-full z-0"
              />
            </div>

            <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2 tracking-tight">You're Offline</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed max-w-[260px]">
              We can't reach the servers. Please check your internet connection and try again.
            </p>

            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                ${isRetrying 
                  ? 'bg-slate-800 shadow-slate-900/20' 
                  : 'bg-[#1C1C1E] hover:bg-black shadow-black/20 hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {isRetrying ? (
                <>
                  <RefreshCcw className="size-5 animate-spin" />
                  Checking connection...
                </>
              ) : (
                'Try Again'
              )}
            </button>
            
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Waiting for network
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
