import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { AdminInventoryService } from "@/lib/services/admin/admin-inventory-service";
import { InventoryLog } from "@/lib/enterprise-data";
import { toast } from "sonner";
import { ArrowLeft, Search, Download, Calendar, Filter, User } from "lucide-react";

export const Route = createFileRoute("/admin/inventory/history")({
  component: InventoryHistory,
});

function InventoryHistory() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminInventoryService.getInventoryLogs();
      setLogs(data);
    } catch (error) {
      toast.error("Failed to load inventory logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter(log => 
    log.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'added': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'sold': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'damaged': 
      case 'expired':
      case 'lost': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full pb-20 bg-slate-50 min-h-screen -mt-6 pt-6 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/admin/inventory"
            className="size-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#2C2C2E] transition-colors shadow-sm"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Inventory History</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Immutable ledger of all stock movements.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
          <Download className="size-4" /> Export CSV
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-180px)] min-h-[500px] overflow-hidden">
        
        {/* Sticky Header Section */}
        <div className="shrink-0 bg-white z-20 border-b border-slate-200">
          <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative max-w-sm w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
            <div className="flex gap-2">
              <button className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar className="size-4 text-slate-400" /> Date Range
              </button>
              <button className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 flex items-center gap-2">
                <Filter className="size-4 text-slate-400" /> Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-t border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Product / Date</div>
            <div className="col-span-2 text-center">Previous</div>
            <div className="col-span-2 text-center">Movement</div>
            <div className="col-span-2 text-center">New Total</div>
            <div className="col-span-2">Reason / Admin</div>
            <div className="col-span-1">Notes</div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading history logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No records found.</div>
          ) : (
            <div className="flex flex-col">
              {filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors">
                  
                  <div className="col-span-3 flex flex-col gap-1">
                    <p className="font-bold text-slate-800 text-sm truncate">{log.productName}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="font-mono text-slate-500">{log.previousQuantity}</span>
                  </div>

                  <div className="col-span-2 flex justify-center">
                    <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-lg flex items-center justify-center min-w-[3rem] ${
                      log.difference > 0 ? 'bg-emerald-100 text-emerald-700' : 
                      log.difference < 0 ? 'bg-rose-100 text-rose-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.difference > 0 ? '+' : ''}{log.difference}
                    </span>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="font-mono font-black text-slate-800">{log.newQuantity}</span>
                  </div>

                  <div className="col-span-2 flex flex-col items-start gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getReasonColor(log.reason)}`}>
                      {log.reason.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                      <User className="size-3" /> {log.adminName}
                    </span>
                  </div>

                  <div className="col-span-1">
                    {log.notes ? (
                      <span className="text-xs text-slate-600 italic line-clamp-2" title={log.notes}>{log.notes}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
