import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRewardsStore } from '@/lib/rewards-store';
import { Gift } from 'lucide-react';

const PRIZES = [
  { label: '10', color: '#10B981', value: 10 },
  { label: '50', color: '#F59E0B', value: 50 },
  { label: '10', color: '#10B981', value: 10 },
  { label: '100', color: '#3B82F6', value: 100 },
  { label: '10', color: '#10B981', value: 10 },
  { label: 'Oops', color: '#EF4444', value: 0 },
  { label: '500', color: '#8B5CF6', value: 500 },
  { label: 'Oops', color: '#EF4444', value: 0 },
];

export function LuckySpin() {
  const { spinAvailable, playSpin } = useRewardsStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<number | null>(null);

  const handleSpin = () => {
    if (!spinAvailable || isSpinning) return;
    setIsSpinning(true);
    setPrize(null);

    // Call store to consume the spin and get the winning amount
    const winAmount = playSpin();
    
    // Find the index of the prize to animate the wheel to the correct slice
    // Randomly select one if there are multiple same amounts
    const possibleIndices = PRIZES.map((p, i) => p.value === winAmount ? i : -1).filter(i => i !== -1);
    const targetIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
    
    // 360 / 8 slices = 45 degrees per slice
    // To land on a slice, the top (0 degrees) should point to it.
    // CSS rotation: offset so targetIndex lands at the top.
    const sliceAngle = 360 / PRIZES.length;
    // Add extra spins (e.g. 5 full rotations = 1800)
    const extraSpins = 1800;
    // Calculate final rotation
    const targetRotation = extraSpins + (360 - (targetIndex * sliceAngle)) - (sliceAngle / 2);
    
    // We add to the current rotation so it spins smoothly from wherever it is
    const newRotation = rotation + targetRotation + (360 - (rotation % 360));
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setPrize(winAmount);
      if (winAmount > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 4000); // 4 seconds animation
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-64 h-64 mx-auto mb-8 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        {/* Pointer */}
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-6 h-8 bg-white z-20" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        
        {/* Wheel */}
        <motion.div
          className="w-full h-full rounded-full border-4 border-slate-700 overflow-hidden relative"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {PRIZES.map((p, i) => {
            const angle = i * (360 / PRIZES.length);
            return (
              <div 
                key={i}
                className="absolute w-1/2 h-full origin-right"
                style={{
                  backgroundColor: p.color,
                  transform: `rotate(${angle}deg)`,
                  clipPath: 'polygon(100% 50%, 0 0, 0 100%)' // For 8 slices, actually need conic gradient, but let's use conic-gradient on the parent
                }}
              />
            )
          })}
          
          {/* Real conic gradient for accuracy in CSS */}
          <div 
            className="absolute inset-0"
            style={{
              background: `conic-gradient(${PRIZES.map((p, i) => {
                const step = 360 / PRIZES.length;
                return `${p.color} ${i * step}deg ${(i + 1) * step}deg`;
              }).join(', ')})`
            }}
          />
          
          {/* Labels */}
          {PRIZES.map((p, i) => {
            const step = 360 / PRIZES.length;
            const angle = i * step + (step / 2);
            return (
              <div
                key={`label-${i}`}
                className="absolute inset-0 flex justify-center z-10"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div className="text-white font-bold text-sm pt-4 drop-shadow-md">
                  {p.label}
                </div>
              </div>
            )
          })}
          
          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-900 z-20 flex items-center justify-center shadow-inner">
            <div className="w-4 h-4 bg-slate-700 rounded-full" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {prize !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <h4 className="text-xl font-semibold text-white mb-1">
              {prize > 0 ? `You won ${prize} pts!` : 'Better luck next time!'}
            </h4>
            <p className="text-slate-400 text-sm">Come back tomorrow for another spin.</p>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={!spinAvailable || isSpinning}
            className={`w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2
              ${spinAvailable 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white hover:from-emerald-400 hover:to-emerald-300' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            {isSpinning ? 'Spinning...' : spinAvailable ? <><Gift className="size-4" /> Spin Now</> : 'Spin Available Tomorrow'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
