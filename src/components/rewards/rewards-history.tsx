import { ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react';
import { useRewardsStore } from '@/lib/rewards-store';

export function RewardsHistory() {
  const { history } = useRewardsStore();

  return (
    <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200 min-h-[400px]">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-[#2C2C2E] mb-2">Rewards History</h2>
        <p className="text-slate-500 font-medium">Track your points earned and redeemed.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
           <Calendar className="size-12 mx-auto mb-4 opacity-20" />
           <p>No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((tx) => {
            const isEarn = tx.type === 'earn';
            const dateStr = new Date(tx.date).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            });

            return (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarn ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isEarn ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2C2C2E]">{tx.description}</h4>
                      <p className="text-xs text-slate-500">{dateStr}</p>
                    </div>
                 </div>
                 <div className={`font-bold text-lg ${isEarn ? 'text-emerald-500' : 'text-[#2C2C2E]'}`}>
                   {isEarn ? '+' : '-'}{tx.amount}
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

