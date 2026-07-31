import React, { memo } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface ProductPaginationProps {
  total: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const ProductPagination = memo(function ProductPagination({ total, currentPage, itemsPerPage, onPageChange }: ProductPaginationProps) {
  const start = ((currentPage - 1) * itemsPerPage) + 1;
  const end = Math.min(currentPage * itemsPerPage, total);
  const totalPages = Math.ceil(total / itemsPerPage);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between py-4 mt-2">
      <div className="text-sm font-medium text-slate-500">
        Showing {start}–{end} of {total} Products
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="size-4" />
        </button>
        
        {/* Render simple pagination for demo. A full implementation would calculate dynamic page ranges */}
        {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
          const page = idx + 1;
          const isCurrent = page === currentPage;
          return (
            <button 
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                isCurrent 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-bold' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              {page}
            </button>
          );
        })}

        {totalPages > 3 && (
          <>
            <span className="px-2 text-slate-400">
              <MoreHorizontal className="size-4" />
            </span>
            <button 
              onClick={() => onPageChange(totalPages)}
              className={`px-3 py-1 border rounded-lg text-sm transition-colors ${
                currentPage === totalPages
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-bold' 
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
});
