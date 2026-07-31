import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { usePersistedState } from '@/lib/hooks/use-persisted-state';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Award, Gift, History, Target, Sparkles, ChevronRight, Share2, Coins, Heart } from 'lucide-react';
import { useRewardsStore } from '@/lib/rewards-store';
import { RewardsDashboard } from '@/components/rewards/rewards-dashboard';
import { RewardStore } from '@/components/rewards/reward-store';
import { Achievements } from '@/components/rewards/achievements';
import { RewardsHistory } from '@/components/rewards/rewards-history';
import { LuckySpin } from '@/components/rewards/games/lucky-spin';
import { ScratchCard } from '@/components/rewards/games/scratch-card';

export const Route = createFileRoute('/rewards')({
  component: RewardsPage,
});

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Award },
  { id: 'earn', label: 'Earn Points', icon: Target },
  { id: 'redeem', label: 'Redeem', icon: Gift },
  { id: 'history', label: 'History', icon: History },
];

function RewardsPage() {
  const [activeTab, setActiveTab] = usePersistedState('rewards_tab', 'dashboard');
  const { points } = useRewardsStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <RewardsDashboard onNavigate={setActiveTab} />;
      case 'earn': return <EarnSection />;
      case 'redeem': return <RewardStore />;
      case 'history': return <RewardsHistory />;
      case 'achievements': return <Achievements />;
      default: return <RewardsDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white pt-10 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 mb-2">
              <Sparkles className="text-emerald-400 size-6" /> Rewards Hub
            </h1>
            <p className="text-slate-400 font-medium">Unlock exclusive benefits and premium offers</p>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
             <Link to="/wishlist" className="bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[90px] shadow-lg group">
                <Heart className="size-6 text-rose-400 group-hover:scale-110 transition-transform mb-1" />
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">Wishlist</span>
             </Link>
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px] sm:min-w-[120px] shadow-lg">
                <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Available Points</div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <Coins className="size-5 sm:size-6 text-amber-400 fill-amber-400" />
                  <AnimatedNumber value={points} />
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-2 flex overflow-x-auto mb-8 hide-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex-1 justify-center ${isActive ? 'text-[#2C2C2E]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="rewards-tab"
                    className="absolute inset-0 bg-slate-100 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`size-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EarnSection() {
  const { addPoints } = useRewardsStore();
  
  return (
    <div className="space-y-8">
      {/* Daily Check in preview */}
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#2C2C2E] flex items-center gap-2">
            <Target className="size-5 text-emerald-500" /> Ways to Earn
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EarnCard 
            title="Complete your Profile" 
            desc="Add your phone number and address"
            points={50}
            action="Complete"
            onClick={() => addPoints(50, 'Profile Completion')}
          />
          <EarnCard 
            title="Refer a Friend" 
            desc="Invite a friend and they place their first order"
            points={500}
            action="Invite"
            onClick={() => addPoints(500, 'Referral Bonus')}
          />
          <EarnCard 
            title="Write a Review" 
            desc="Review a product you recently bought"
            points={20}
            action="Review"
            onClick={() => addPoints(20, 'Product Review')}
          />
          <EarnCard 
            title="Buy Organic Products" 
            desc="Purchase any 3 organic items"
            points={100}
            action="Shop"
            onClick={() => addPoints(100, 'Organic Shopper Bonus')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lucky Spin Integration */}
        <div className="md:col-span-1 bg-slate-900 rounded-[24px] overflow-hidden shadow-lg border border-slate-800 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-8 relative z-10 flex flex-col items-center">
            <h3 className="text-2xl font-semibold text-white mb-2 self-start">Lucky Spin</h3>
            <p className="text-slate-400 text-sm mb-6 self-start">Test your luck daily!</p>
            <LuckySpin />
          </div>
        </div>

        {/* Scratch Card */}
        <div className="md:col-span-1 bg-slate-100 rounded-[24px] overflow-hidden shadow-sm border border-slate-200 relative group flex flex-col justify-center items-center p-6 text-center">
           <h3 className="text-2xl font-semibold text-[#2C2C2E] mb-2">Scratch & Win</h3>
           <p className="text-slate-500 text-sm mb-6">Reveal your mystery prize!</p>
           <ScratchCard />
        </div>
        
        {/* Referral Program */}
        <div className="md:col-span-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[24px] overflow-hidden shadow-lg p-8 text-white flex flex-col justify-between">
           <div>
             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4">
               <Share2 className="size-3" /> Get 500 Points
             </div>
             <h3 className="text-2xl font-semibold mb-2">Invite Friends</h3>
             <p className="text-emerald-50 text-sm mb-8 leading-relaxed">Give your friends ₹100 off their first order. When they buy, you get 500 points!</p>
           </div>
           
           <div className="bg-black/20 rounded-xl p-1 flex items-center">
             <div className="flex-1 text-center font-mono font-bold tracking-widest text-lg">
               FRESH2026
             </div>
             <button className="bg-white text-emerald-600 px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors shadow-sm">
               Copy Link
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function EarnCard({ title, desc, points, action, onClick }: { title: string, desc: string, points: number, action: string, onClick: () => void }) {
  const [claimed, setClaimed] = useState(false);
  
  return (
    <div className="flex flex-col p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-[#2C2C2E]">{title}</h4>
        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded text-xs">
          +{points} pts
        </span>
      </div>
      <p className="text-xs text-slate-500 mb-4 flex-1">{desc}</p>
      <button 
        onClick={() => {
          if(!claimed) {
            onClick();
            setClaimed(true);
          }
        }}
        disabled={claimed}
        className={`w-full py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-colors ${claimed ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
      >
        {claimed ? 'Claimed' : action} <ChevronRight className="size-3.5" />
      </button>
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

