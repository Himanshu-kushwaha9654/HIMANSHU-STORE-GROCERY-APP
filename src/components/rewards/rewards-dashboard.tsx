import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { ChevronRight, CalendarCheck, Crown, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { useRewardsStore } from '@/lib/rewards-store';
import { DailyCheckIn } from './daily-checkin';
import { MembershipTiers } from './membership-tiers';

export function RewardsDashboard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { points, activeTier, highestUnlockedTier, lifetimePoints, streak } = useRewardsStore();
  const prevTierRef = useRef(highestUnlockedTier);

  useEffect(() => {
    if (prevTierRef.current !== highestUnlockedTier) {
      // Tier upgraded!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.3 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6']
      });
      toast.success(`🎉 Congratulations! You unlocked the ${highestUnlockedTier} Membership.`);
      prevTierRef.current = highestUnlockedTier;
    }
  }, [highestUnlockedTier]);

  const getTierDetails = () => {
    switch(activeTier) {
      case 'Platinum': return { color: 'text-[#2C2C2E]', bg: 'bg-gradient-to-r from-slate-200 to-slate-400', next: null, target: 10000, current: lifetimePoints };
      case 'Gold': return { color: 'text-amber-900', bg: 'bg-gradient-to-r from-amber-200 to-yellow-400', next: 'Platinum', target: 10000, current: lifetimePoints };
      case 'Fresh': return { color: 'text-teal-900', bg: 'bg-gradient-to-r from-teal-200 to-emerald-400', next: 'Gold', target: 5000, current: lifetimePoints };
      default: return { color: 'text-green-900', bg: 'bg-gradient-to-r from-green-200 to-emerald-300', next: 'Fresh', target: 1000, current: lifetimePoints };
    }
  };

  const tierDetails = getTierDetails();
  const progress = tierDetails.next ? Math.min(100, Math.round((tierDetails.current / tierDetails.target) * 100)) : 100;

  return (
    <div className="space-y-6">
      
      {/* Tier Status Card */}
      <div className={`rounded-[32px] p-8 shadow-lg relative overflow-hidden ${tierDetails.bg}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
             <AnimatePresence mode="popLayout">
               <motion.div 
                 key={activeTier}
                 initial={{ scale: 0.8, opacity: 0, y: 10 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 backdrop-blur-md font-bold text-xs uppercase tracking-wider mb-4 shadow-sm"
               >
                 <Crown className="size-3.5" /> {activeTier} Member
               </motion.div>
             </AnimatePresence>
             
             <h2 className={`text-4xl font-bold tracking-tight mb-2 ${tierDetails.color}`}>
               You're in the top tier!
             </h2>
             <p className={`${tierDetails.color} opacity-80 font-medium mb-6`}>
               Enjoy free deliveries and 5% cashback on all orders.
             </p>

             {tierDetails.next && (
               <div className="space-y-2 max-w-sm mt-4">
                 <div className="flex justify-between text-sm font-bold opacity-80 mb-1">
                   <span>{tierDetails.current} pts</span>
                   <span>{tierDetails.target} pts to {tierDetails.next}</span>
                 </div>
                 <div className="h-3 bg-black/10 rounded-full overflow-hidden p-0.5">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className="h-full bg-white rounded-full shadow-sm"
                   />
                 </div>
                 <p className="text-xs opacity-75 font-medium text-right mt-1">Need {tierDetails.target - tierDetails.current} more points</p>
               </div>
             )}
          </div>
          
          <div className="flex-shrink-0 relative">
             <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-xl relative z-10">
               <div className="text-center">
                 <div className="text-sm font-bold opacity-80 uppercase tracking-widest mb-1">Points</div>
                 <div className={`text-3xl md:text-4xl font-bold ${tierDetails.color}`}>
                   <AnimatedNumber value={points} />
                 </div>
               </div>
             </div>
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full"
             />
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <DailyCheckIn />

      {/* Membership Tiers Overview */}
      <MembershipTiers />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => onNavigate('redeem')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between hover:border-emerald-300 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="size-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#2C2C2E]">Redeem Points</h3>
              <p className="text-sm text-slate-500">Get free delivery & discounts</p>
            </div>
          </div>
          <ChevronRight className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </button>

        <button onClick={() => onNavigate('achievements')} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-300 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="size-6" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#2C2C2E]">Achievements</h3>
              <p className="text-sm text-slate-500">View your badges & trophies</p>
            </div>
          </div>
          <ChevronRight className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

    </div>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(value);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-IN'));

  useEffect(() => {
    const animation = animate(count, value, { duration: 1, ease: 'easeOut' });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

