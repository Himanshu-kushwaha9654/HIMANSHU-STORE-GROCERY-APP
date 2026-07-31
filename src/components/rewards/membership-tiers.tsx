import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sparkles, Crown, Diamond, Lock, Check, ChevronRight, X } from 'lucide-react';
import { useRewardsStore, Tier } from '@/lib/rewards-store';

const TIERS = [
  {
    id: 'Green',
    name: 'Green',
    icon: Leaf,
    points: 0,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    modalGradient: 'from-emerald-400 to-emerald-600',
    textGradient: 'from-emerald-700 to-emerald-900',
    benefits: [
      { title: 'Earn 1x Points', desc: 'Receive standard reward points on every purchase.' },
      { title: 'Access to Offers', desc: 'Get access to members-only exclusive offers.' },
      { title: 'Standard Support', desc: 'Access to our 24/7 customer support team.' }
    ],
  },
  {
    id: 'Fresh',
    name: 'Fresh',
    icon: Sparkles,
    points: 1000,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    modalGradient: 'from-teal-400 to-cyan-600',
    textGradient: 'from-teal-800 to-cyan-900',
    benefits: [
      { title: 'Earn 1.5x Points', desc: 'Receive 50% more reward points on every purchase.' },
      { title: 'Free Delivery', desc: 'Enjoy free delivery on all orders above ₹500.' },
      { title: 'Priority Support', desc: 'Skip the queue with our priority support channel.' }
    ],
  },
  {
    id: 'Gold',
    name: 'Gold',
    icon: Crown,
    points: 5000,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    modalGradient: 'from-[#FFF7CC] via-[#FFE082] to-[#FFD54F]',
    textGradient: 'from-amber-600 to-amber-900',
    benefits: [
      { title: 'Earn 2x Points', desc: 'Receive double reward points on every purchase.' },
      { title: 'Free Delivery', desc: 'Free delivery on all orders above ₹300.' },
      { title: 'Early Access', desc: 'Shop exclusive sales before everyone else.' },
      { title: 'Cashback', desc: 'Get 2% cashback on eligible orders.' }
    ],
  },
  {
    id: 'Platinum',
    name: 'Platinum',
    icon: Diamond,
    points: 10000,
    color: 'bg-slate-800 text-slate-100 border-slate-700',
    modalGradient: 'from-slate-800 via-slate-900 to-black',
    textGradient: 'from-slate-100 to-slate-300',
    benefits: [
      { title: 'Earn 3x Points', desc: 'Triple reward points on every single purchase.' },
      { title: 'Unlimited Free Delivery', desc: 'Zero delivery fees on all orders, no minimum.' },
      { title: 'VIP Support', desc: 'Dedicated 24/7 VIP concierge support line.' },
      { title: '5% Cashback', desc: 'Maximum 5% cashback on all eligible orders.' },
      { title: 'Surprise Gifts', desc: 'Receive premium surprise samples with your orders.' }
    ],
  },
];

export function MembershipTiers() {
  const { activeTier, lifetimePoints, activateTier } = useRewardsStore();
  const [selectedTier, setSelectedTier] = useState<typeof TIERS[0] | null>(null);

  // Focus trap & ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTier(null);
    };
    if (selectedTier) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTier]);

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold tracking-tight text-[#2C2C2E] mb-2">Membership Tiers</h3>
        <p className="font-medium text-slate-500">Unlock more benefits as you earn points</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {TIERS.map((t) => {
          const isActive = t.id === activeTier;
          const isUnlocked = lifetimePoints >= t.points;
          const Icon = t.icon;
          
          return (
            <motion.div
              key={t.id}
              onClick={() => setSelectedTier(t)}
              whileHover={{ y: -6, scale: isActive ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col rounded-[24px] p-6 border-2 cursor-pointer transition-all duration-300 group
                ${isActive 
                  ? 'border-emerald-500 bg-emerald-50/10 shadow-[0_8px_30px_rgba(16,185,129,0.15)] scale-[1.02]' 
                  : isUnlocked 
                    ? 'bg-slate-50 border-transparent hover:border-slate-200 hover:shadow-lg'
                    : 'bg-slate-50 border-transparent opacity-75 hover:opacity-100 hover:shadow-md'
                }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 text-white"></span>
                  </span>
                  Active
                </div>
              )}
              
              {!isUnlocked && (
                <div className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-500 group-hover:bg-slate-300 transition-colors" title={`Unlock at ${t.points} points`}>
                  <Lock className="size-4" />
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${isUnlocked ? t.color.split(' ')[0] + ' ' + t.color.split(' ')[1] : 'bg-slate-200 text-slate-400'}`}>
                <Icon className="size-7" />
              </div>
              
              <h4 className={`font-bold text-xl mb-1 ${isActive ? 'text-[#2C2C2E]' : 'text-[#2C2C2E]'}`}>{t.name}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                {t.points === 0 ? 'Entry Tier' : `${t.points.toLocaleString('en-IN')}+ pts`}
              </p>
              
              <ul className="space-y-3 mt-auto">
                {t.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isUnlocked ? 'bg-slate-400' : 'bg-slate-300'}`} />
                    <span className="leading-tight truncate">{benefit.title}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>

      {/* Premium Luxury Modal */}
      <AnimatePresence>
        {selectedTier && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4 sm:py-8 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedTier(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-[8px] cursor-pointer pointer-events-auto" 
            />
            
            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
              className="relative z-10 w-full sm:max-w-[650px] bg-white sm:rounded-[32px] rounded-t-[32px] rounded-b-none overflow-hidden shadow-2xl flex flex-col max-h-[90vh] pointer-events-auto border border-white/20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`
              }}
              role="dialog"
              aria-modal="true"
            >
              {/* Premium Luxury Header Gradient */}
              <div className={`relative p-8 md:p-12 text-center shrink-0 overflow-hidden bg-gradient-to-br ${selectedTier.modalGradient}`}>
                {/* Light Rays & Glows */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent opacity-80" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,_transparent_0deg,_rgba(255,255,255,0.2)_45deg,_transparent_90deg)] opacity-50"
                />
                
                {/* Gold shimmer line passing through every 10s */}
                <motion.div 
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 10, ease: "easeInOut" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]"
                />

                {/* Close Button */}
                <motion.button 
                  onClick={() => setSelectedTier(null)}
                  whileHover={{ rotate: 90, scale: 1.1, backgroundColor: "rgba(255,255,255,0.8)" }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-[#2C2C2E] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors z-20"
                >
                  <X className="size-5" strokeWidth={2.5} />
                </motion.button>

                <div className="relative z-10 flex flex-col items-center">
                  {/* Premium Glass Badge Icon */}
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-28 h-28 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.2)] mb-6 border border-white/50 relative group`}
                  >
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <selectedTier.icon className={`size-14 ${selectedTier.id === 'Platinum' ? 'text-[#2C2C2E]' : selectedTier.id === 'Gold' ? 'text-amber-500' : selectedTier.id === 'Fresh' ? 'text-teal-500' : 'text-emerald-500'}`} />
                  </motion.div>
                  
                  {/* Title */}
                  <h3 className={`text-5xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r ${selectedTier.textGradient} filter drop-shadow-sm`}>
                    {selectedTier.name}
                  </h3>
                  
                  {/* Subtitle Pill */}
                  {(() => {
                    const isActive = activeTier === selectedTier.id;
                    const isUnlocked = lifetimePoints >= selectedTier.points;
                    
                    if (isActive) {
                      return (
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/90 backdrop-blur-md text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-white/50">
                          <Check className="size-3.5" /> Active Status
                        </div>
                      );
                    }
                    if (isUnlocked) {
                      return (
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/90 backdrop-blur-md text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-white/50">
                          <Sparkles className="size-3.5" /> Unlocked
                        </div>
                      );
                    }
                    return (
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/80 backdrop-blur-md text-slate-700 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-white/50">
                        <Lock className="size-3.5" /> Locked Tier
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="p-6 md:p-10 overflow-y-auto bg-slate-50/50">
                
                {/* Progress Section */}
                <div className="bg-white rounded-3xl p-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Points</div>
                      <div className="text-2xl font-bold text-[#2C2C2E]">{lifetimePoints.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Progress</div>
                      <div className="text-lg font-bold text-emerald-600">{Math.min(100, Math.round((lifetimePoints / (selectedTier.points || 1)) * 100))}%</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Required</div>
                      <div className="text-2xl font-bold text-[#2C2C2E]">{selectedTier.points.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  
                  {/* Animated Progress Bar */}
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (lifetimePoints / (selectedTier.points || 1)) * 100)}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                      className={`absolute top-0 bottom-0 left-0 bg-gradient-to-r ${selectedTier.modalGradient} rounded-full`}
                    >
                      <motion.div 
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
                      />
                    </motion.div>
                  </div>

                  {lifetimePoints < selectedTier.points && (
                    <div className="mt-4 text-center text-sm font-bold text-slate-500">
                      <span className="text-amber-500">{(selectedTier.points - lifetimePoints).toLocaleString('en-IN')} points remaining</span> to unlock this tier
                    </div>
                  )}
                </div>

                {/* Benefits */}
                <h4 className="font-semibold text-[#2C2C2E] mb-5 text-xl tracking-tight">Tier Benefits</h4>
                <div className="space-y-4 mb-10">
                  {selectedTier.benefits.map((benefit, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (i * 0.05) }}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className="flex items-start gap-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all cursor-default"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner bg-gradient-to-br ${selectedTier.modalGradient} text-white`}>
                        <Sparkles className="size-5 drop-shadow-sm" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-[#2C2C2E] text-base mb-1">{benefit.title}</h5>
                        <p className="font-medium text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* CTA Button */}
                {(() => {
                  const isActive = activeTier === selectedTier.id;
                  const isUnlocked = lifetimePoints >= selectedTier.points;
                  const remaining = selectedTier.points - lifetimePoints;
                  
                  if (isActive) {
                    return (
                      <button className="w-full py-5 rounded-[20px] font-bold flex items-center justify-center gap-2 bg-slate-100 text-slate-400 cursor-not-allowed text-lg border border-slate-200">
                        <Check className="size-5" /> Currently Active
                      </button>
                    );
                  }
                  
                  if (isUnlocked) {
                    return (
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          activateTier(selectedTier.id as Tier);
                          setSelectedTier(null);
                        }}
                        className={`w-full py-5 rounded-[20px] font-bold transition-all shadow-xl text-white text-lg flex items-center justify-center gap-2 relative overflow-hidden bg-gradient-to-r ${selectedTier.modalGradient}`}
                      >
                        <motion.div 
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                        />
                        <span className="relative z-10 flex items-center gap-2 text-[#2C2C2E] drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
                          Activate Membership <ChevronRight className="size-5" />
                        </span>
                      </motion.button>
                    );
                  }
                  
                  return (
                    <button className="w-full py-5 rounded-[20px] font-bold bg-slate-100 text-slate-400 flex flex-col items-center justify-center gap-1 cursor-not-allowed text-base border border-slate-200 group">
                      <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-amber-500">
                          <Lock className="size-4" />
                        </motion.div>
                        <span>Locked until <span className="font-bold text-slate-600">{selectedTier.points.toLocaleString('en-IN')} Points</span></span>
                      </div>
                      <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                        Need {remaining.toLocaleString('en-IN')} More
                      </div>
                    </button>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

