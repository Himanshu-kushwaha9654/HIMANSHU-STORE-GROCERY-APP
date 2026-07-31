import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, Gift, Coins, Check, Zap } from 'lucide-react';
import { useRewardsStore } from '@/lib/rewards-store';

const CATALOG = [
  { id: 'free-del', title: 'Free Delivery', desc: 'Valid on next order', points: 150, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: '50-off', title: '₹50 Coupon', desc: 'Flat discount', points: 300, icon: ShoppingBag, color: 'text-rose-500', bg: 'bg-rose-50' },
  { id: '100-off', title: '₹100 Coupon', desc: 'On orders above ₹500', points: 500, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'cashback', title: '5% Cashback', desc: 'On your next 3 orders', points: 800, icon: Coins, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'premium-trial', title: 'Premium Trial', desc: '7 Days Gold Membership', points: 2000, icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export function RewardStore() {
  const { points, redeemPoints } = useRewardsStore();
  const [redeemedId, setRedeemedId] = useState<string | null>(null);

  const handleRedeem = (id: string, cost: number, title: string) => {
    if (redeemPoints(cost, `Redeemed: ${title}`)) {
      setRedeemedId(id);
      setTimeout(() => setRedeemedId(null), 3000);
    }
  };

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2C2C2E] mb-2">Reward Store</h2>
          <p className="text-slate-500 font-medium">Use your points to claim exclusive benefits.</p>
        </div>
        
        <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg self-start sm:self-auto">
          <Coins className="size-5 text-amber-400 fill-amber-400" />
          <span className="font-bold">{points.toLocaleString('en-IN')} pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {CATALOG.map((item) => {
          const canAfford = points >= item.points;
          const isRedeemed = redeemedId === item.id;
          const Icon = item.icon;

          return (
            <div 
              key={item.id}
              className="relative p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 overflow-hidden group hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0 shadow-inner`}>
                  <Icon className="size-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2C2C2E] text-lg leading-tight mb-1">{item.title}</h3>
                  <p className="text-xs font-medium text-slate-500 mb-4">{item.desc}</p>
                  
                  <button
                    onClick={() => handleRedeem(item.id, item.points, item.title)}
                    disabled={!canAfford || isRedeemed}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                      ${isRedeemed 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : canAfford 
                          ? 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {isRedeemed ? (
                      <><Check className="size-4" /> Redeemed</>
                    ) : (
                      <>{item.points} pts</>
                    )}
                  </button>
                </div>
              </div>

              {/* Success Overlay */}
              <AnimatePresence>
                {isRedeemed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4"
                  >
                    <motion.div
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ type: "spring", bounce: 0.5 }}
                    >
                      <Check className="size-10 mb-2" />
                    </motion.div>
                    <h4 className="font-semibold text-center">Reward Claimed!</h4>
                    <p className="text-xs text-emerald-100 mt-1">Check your active offers.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

