import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, MapPin, MoreVertical, CheckCircle2, Briefcase, Home as HomeIcon, Map } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddressService, SavedAddress } from "@/lib/services/address-service";
import { toast } from "sonner";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { Button } from "@/components/ui/button";
import { useAddressStore } from "@/lib/address-store";

export const Route = createFileRoute("/_authenticated/addresses")({
  head: () => ({ meta: [{ title: "Saved Addresses — Himanshu Store" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const goBack = useNavigateBack();
  const addresses = useAddressStore(s => s.addresses);
  const isLoading = useAddressStore(s => s.isLoading);
  const setIsPickerOpen = useAddressStore((s) => s.setIsPickerOpen);
  const setDefaultAddress = useAddressStore(s => s.setDefaultAddress);
  const deleteAddress = useAddressStore(s => s.deleteAddress);

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated");
    } catch (err) {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAddress(id);
      toast.success("Address removed");
    } catch (err) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-bold text-[#1C1C1E] tracking-tight text-[17px]">Saved Addresses</h1>
        <div className="size-10" />
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 mt-4">
        
        {/* Add New Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold mb-8 shadow-sm hover:bg-emerald-100 transition-colors"
          onClick={() => setIsPickerOpen(true, null)}
        >
          <Plus className="size-5" /> Add New Address
        </motion.button>

        <h2 className="text-lg font-bold text-[#1C1C1E] mb-4 tracking-tight">Your Addresses</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse shadow-sm" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-[24px] border border-slate-100 shadow-sm">
            <Map className="size-12 text-emerald-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1C1C1E] mb-1">No saved addresses</h3>
            <p className="text-slate-500 text-sm">Add an address to speed up your checkout.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {addresses.map((addr) => {
                const Icon = addr.type === 'Home' ? HomeIcon : addr.type === 'Work' ? Briefcase : MapPin;
                return (
                  <motion.div
                    key={addr.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white p-5 rounded-[24px] border shadow-sm transition-all relative overflow-hidden group ${addr.isDefault ? 'border-emerald-200 shadow-emerald-500/5' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    {addr.isDefault && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> DEFAULT
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100 transition-colors'}`}>
                        <Icon className="size-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-[#1C1C1E] text-base">{addr.type}</h3>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed truncate">
                          {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}
                        </p>
                        <p className="text-slate-400 text-xs font-medium mt-1 uppercase tracking-wider">{addr.recipientName} • {addr.phone}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-50">
                      {!addr.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-emerald-600 text-xs font-bold hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Set Default
                        </button>
                      )}
                      <div className="flex-1" />
                      <button 
                        className="text-slate-500 text-xs font-bold hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
                        onClick={() => setIsPickerOpen(true, addr)}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
