import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

const INITIAL_TASKS = [
  { id: 1, title: "Approve 12 pending orders", isCompleted: false, priority: "high" },
  { id: 2, title: "Verify 3 refund requests", isCompleted: false, priority: "high" },
  { id: 3, title: "Restock fresh vegetables", isCompleted: false, priority: "medium" },
  { id: 4, title: "Reply to customer support queries", isCompleted: true, priority: "medium" },
  { id: 5, title: "Update weekend promo banner", isCompleted: false, priority: "low" },
];

export function PendingTasks() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Pending Tasks</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Your daily checklist</p>
        </div>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-lg">
          {tasks.filter(t => t.isCompleted).length}/{tasks.length} Done
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors group ${
              task.isCompleted ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              {task.isCompleted ? (
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="size-5 text-slate-300 group-hover:text-emerald-400 shrink-0 transition-colors" />
              )}
              <span className={`text-sm font-bold transition-all ${
                task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-700 group-hover:text-emerald-700'
              }`}>
                {task.title}
              </span>
            </div>
            {!task.isCompleted && (
              <span className={`w-2 h-2 rounded-full ${
                task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
              }`} />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
