import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRewardsStore } from '@/lib/rewards-store';
import confetti from 'canvas-confetti';
import { Check } from 'lucide-react';

export function ScratchCard() {
  const { spinAvailable, playSpin, addPoints } = useRewardsStore();
  const [isScratched, setIsScratched] = useState(false);
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use the same availability check as spin for simplicity, 
  // or just track it separately. We'll use a local state for the demo.
  const [canScratch, setCanScratch] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canScratch || isScratched) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine win amount early
    const prizes = [10, 20, 50, 10, 100, 0];
    const prize = prizes[Math.floor(Math.random() * prizes.length)];
    setWinAmount(prize);

    // Setup canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw silver coating
    ctx.fillStyle = '#cbd5e1'; // slate-300
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some noise/pattern to make it look like a scratch card
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#94a3b8' : '#e2e8f0';
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 7);

    let isDrawing = false;
    let scratchedPixels = 0;
    const totalPixels = canvas.width * canvas.height;
    
    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Rough approximation of percentage scratched
      // For a real production app, use ImageData to count transparent pixels accurately
      scratchedPixels += Math.PI * 20 * 20; 
      
      if (scratchedPixels / totalPixels > 0.5 && !isScratched) {
        setIsScratched(true);
        if (prize > 0) {
          addPoints(prize, 'Scratch Card Win');
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
      }
    };

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      isDrawing = true;
      handleMouseMove(e);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return;
      
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      
      scratch(clientX - rect.left, clientY - rect.top);
    };

    const handleMouseUp = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    canvas.addEventListener('touchstart', handleMouseDown, { passive: true });
    canvas.addEventListener('touchmove', handleMouseMove, { passive: true });
    canvas.addEventListener('touchend', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchmove', handleMouseMove);
      canvas.removeEventListener('touchend', handleMouseUp);
    };
  }, [canScratch, isScratched]);

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={containerRef}
        className="relative w-full max-w-[280px] h-[160px] rounded-2xl overflow-hidden shadow-inner border-2 border-slate-200 bg-white select-none"
      >
        {/* The Prize Underneath */}
        <div className="absolute inset-0 flex items-center justify-center flex-col bg-slate-50">
          {winAmount !== null && (
            <>
              {winAmount > 0 ? (
                <>
                  <h4 className="text-4xl font-semibold text-emerald-500 mb-1">{winAmount}</h4>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Points Won!</p>
                </>
              ) : (
                <>
                  <h4 className="text-2xl font-semibold text-slate-400 mb-1">Better Luck</h4>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Next Time</p>
                </>
              )}
            </>
          )}
        </div>
        
        {/* The Scratchable Surface */}
        <AnimatePresence>
          {!isScratched && (
            <motion.canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full cursor-pointer touch-none z-10"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isScratched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 w-full"
          >
            <button
              onClick={() => {
                setIsScratched(false);
                setCanScratch(false); // Only 1 scratch per session demo
              }}
              className="w-full py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Check className="size-4" /> Reward Claimed
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
