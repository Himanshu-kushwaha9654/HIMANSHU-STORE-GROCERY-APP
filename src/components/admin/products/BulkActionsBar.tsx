import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Eye, EyeOff, FolderOutput, Tag, X, FileText, Printer } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onAction: (action: string) => void;
}

export function BulkActionsBar({ selectedCount, onClear, onAction }: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-700/50"
        >
          <div className="flex items-center gap-3 border-r border-slate-700 pr-4">
            <span className="flex items-center justify-center size-6 bg-emerald-500 rounded-full text-xs font-bold">
              {selectedCount}
            </span>
            <span className="text-sm font-medium text-slate-300">Selected</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button onClick={() => onAction("publish")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <Eye className="size-4" /> Publish
            </button>
            <button onClick={() => onAction("hide")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <EyeOff className="size-4" /> Hide
            </button>
            <button onClick={() => onAction("category")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <FolderOutput className="size-4" /> Category
            </button>
            <button onClick={() => onAction("price")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <Tag className="size-4" /> Price
            </button>
            <button onClick={() => onAction("export")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <FileText className="size-4" /> Export
            </button>
            <button onClick={() => onAction("labels")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors">
              <Printer className="size-4" /> Labels
            </button>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            <button onClick={() => onAction("delete")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg text-sm font-medium transition-colors">
              <Trash2 className="size-4" /> Delete
            </button>
          </div>

          <button 
            onClick={onClear}
            className="ml-2 p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
