import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle } from "lucide-react";

const INSIGHTS = [
  { id: 1, text: "Milk sales increased 18% today compared to last Tuesday.", type: "positive", icon: <TrendingUp className="size-4" /> },
  { id: 2, text: "Paneer stock is depleting fast and may finish tomorrow.", type: "warning", icon: <AlertTriangle className="size-4" /> },
  { id: 3, text: "Bananas are currently trending in your area.", type: "positive", icon: <TrendingUp className="size-4" /> },
  { id: 4, text: "Weekend sales expected to increase by 25%. Suggest running a 10% Bread discount.", type: "neutral", icon: <Sparkles className="size-4" /> },
];

export function AiBusinessInsights() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="bg-white p-6 rounded-[20px] shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
        <Sparkles className="size-48 text-indigo-900" />
      </div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="size-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">AI Business Insights</h3>
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-center">
        {INSIGHTS.map((insight) => (
          <div key={insight.id} className="flex gap-3 items-start bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-colors cursor-default">
            <div className={`mt-0.5 shrink-0 ${
              insight.type === 'positive' ? 'text-emerald-500' :
              insight.type === 'warning' ? 'text-amber-500' : 'text-indigo-500'
            }`}>
              {insight.icon}
            </div>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
