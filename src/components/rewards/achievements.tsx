import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Flame, Salad, ShoppingCart, UserCheck, Lock, CheckCircle2, Zap } from 'lucide-react';
import { useRewardsStore } from '@/lib/rewards-store';

const CATEGORIES = ['All', 'Shopping', 'Rewards', 'Referrals', 'Streaks'];

const BADGES = [
  { id: 'first-order', title: 'First Order', category: 'Shopping', xp: 100, icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-100', desc: 'Placed your first grocery order' },
  { id: 'top-shopper', title: 'Top Shopper', category: 'Shopping', xp: 500, icon: Star, color: 'text-amber-500', bg: 'bg-amber-100', desc: 'Spent over ₹10,000 total' },
  { id: 'healthy', title: 'Healthy Lifestyle', category: 'Shopping', xp: 200, icon: Salad, color: 'text-green-500', bg: 'bg-green-100', desc: 'Bought 10+ organic products' },
  { id: 'streak-7', title: '7-Day Streak', category: 'Streaks', xp: 300, icon: Flame, color: 'text-rose-500', bg: 'bg-rose-100', desc: 'Checked in 7 days in a row' },
  { id: 'referral', title: 'Influencer', category: 'Referrals', xp: 400, icon: UserCheck, color: 'text-blue-500', bg: 'bg-blue-100', desc: 'Successfully referred a friend' },
  { id: 'premium', title: 'Premium Member', category: 'Rewards', xp: 1000, icon: Award, color: 'text-purple-500', bg: 'bg-purple-100', desc: 'Reached Gold or Platinum tier' },
];

export function Achievements() {
  const { unlockedBadges } = useRewardsStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredBadges = activeCategory === 'All' 
    ? BADGES 
    : BADGES.filter(b => b.category === activeCategory);

  const totalXP = BADGES.reduce((sum, b) => sum + b.xp, 0);
  const earnedXP = BADGES.filter(b => unlockedBadges.includes(b.id)).reduce((sum, b) => sum + b.xp, 0);
  const completionPercentage = Math.round((unlockedBadges.length / BADGES.length) * 100);

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[400px]">
      
      {/* Premium Progress Header */}
      <div className="bg-slate-900 rounded-[24px] p-6 sm:p-8 mb-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
         <div className="relative z-10 flex-1">
           <h2 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
             <Award className="text-amber-400 size-8" /> Achievements
           </h2>
           <p className="text-slate-400 font-medium mb-6">Unlock badges, earn XP, and level up your profile.</p>
           
           <div className="max-w-md">
             <div className="flex justify-between text-sm font-bold mb-2">
               <span className="text-blue-400">{earnedXP} XP</span>
               <span className="text-slate-500">{totalXP} XP</span>
             </div>
             <div className="h-3 bg-white/10 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(earnedXP / totalXP) * 100}%` }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
               />
             </div>
           </div>
         </div>
         
         <div className="relative z-10 flex-shrink-0 text-center bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
           <div className="text-4xl font-bold text-white mb-1">{completionPercentage}%</div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed</div>
         </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-4 hide-scrollbar">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategory === category 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative flex flex-col items-center text-center p-5 rounded-[24px] border-2 transition-all cursor-pointer overflow-hidden group
                  ${isUnlocked 
                    ? 'border-emerald-100 bg-emerald-50/40 shadow-sm hover:shadow-md hover:border-emerald-200' 
                    : 'border-slate-100 bg-slate-50 opacity-80 grayscale hover:grayscale-0 hover:opacity-100 hover:shadow-sm'
                  }
                `}
              >
                {/* XP Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-0.5 text-[10px] font-bold tracking-wider text-slate-400">
                  <Zap className="size-3 text-amber-500 fill-amber-500" /> {badge.xp}
                </div>

                {isUnlocked && (
                  <div className="absolute top-3 right-3 text-emerald-500">
                    <CheckCircle2 className="size-4" />
                  </div>
                )}

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner mt-4 transition-transform group-hover:scale-110
                  ${isUnlocked ? badge.bg + ' ' + badge.color : 'bg-slate-200 text-slate-400'}`
                }>
                  {isUnlocked ? <Icon className="size-8" /> : <Lock className="size-6" />}
                </div>
                
                <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-[#2C2C2E]' : 'text-slate-500'}`}>
                  {badge.title}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 leading-tight">
                  {badge.desc}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}

