import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/settings')({
  component: () => (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 min-h-[500px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-700 capitalize">$mod Management</h2>
        <p className="text-slate-500 mt-2">This module is under construction.</p>
      </div>
    </div>
  )
});
