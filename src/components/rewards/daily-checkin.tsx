import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRewardsStore } from '@/lib/rewards-store';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function DailyCheckIn() {
  const { checkIn, streak, lastCheckIn } = useRewardsStore();
  const [showReward, setShowReward] = useState<{ amount: number; message: string } | null>(null);

  const isToday = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const hasCheckedInToday = isToday(lastCheckIn);

  const handleCheckIn = () => {
    const result = checkIn();
    
    if (result.success) {
      setShowReward({ amount: result.bonus, message: result.message });
      
      // Premium celebration
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B981', '#F59E0B', '#3B82F6']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#F59E0B', '#3B82F6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      setTimeout(() => {
        setShowReward(null);
        toast.success(`+${result.bonus} Points Earned!`);
      }, 3500);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-semibold text-[#2C2C2E] flex items-center gap-2 mb-1">
            <Calendar className="size-5 text-emerald-500" /> Daily Check-in
          </h3>
          <p className="text-sm text-slate-500">Come back every day to earn bonus points!</p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
           <div className="text-amber-500 font-bold text-sm">Streak:</div>
           <div className="text-amber-600 font-bold text-xl">{streak} 🔥</div>
        </div>
      </div>

      <div className="flex justify-between items-center overflow-x-auto pb-4 gap-2 hide-scrollbar">
        {DAYS.map((day, index) => {
          // A simplified visual calendar (just for display)
          // In a real app, this would align exactly with actual dates of the week
          const currentDayOfWeek = new Date().getDay() || 7; // 1-7
          const isPast = index + 1 < currentDayOfWeek;
          const isCurrent = index + 1 === currentDayOfWeek;
          const isChecked = (isPast && streak > 0) || (isCurrent && hasCheckedInToday);

          const pointValue = (index === 6) ? 100 : (index + 1) * 10;

          return (
            <div key={day} className="flex flex-col items-center gap-2 flex-1 min-w-[50px]">
              <motion.div 
                initial={false}
                animate={isChecked ? { scale: [1, 1.2, 1.1] } : { scale: 1 }}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all
                  ${isChecked 
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : isCurrent 
                      ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-500 border-dashed'
                      : 'bg-slate-50 text-slate-400 border border-slate-200'
                  }
                `}
              >
                {isChecked ? <Check className="size-5" /> : `+${pointValue}`}
              </motion.div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`}>
                {day}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleCheckIn}
          disabled={hasCheckedInToday}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2
            ${hasCheckedInToday 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-emerald-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
            }
          `}
        >
          {hasCheckedInToday ? (
             <><Check className="size-4" /> Come back tomorrow</>
          ) : (
             'Claim Daily Points'
          )}
        </button>
      </div>

      {/* Floating Reward Celebration */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 rounded-[24px]"
          >
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-4 shadow-inner border border-amber-200"
            >
              <Check className="size-10" />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#2C2C2E] mb-2">+{showReward.amount} Points!</h2>
            <p className="text-emerald-600 font-bold">{showReward.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

