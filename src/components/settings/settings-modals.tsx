import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SettingsService } from "@/lib/services/settings-service";
import { toast } from "sonner";
import { Loader2, MonitorSmartphone, Smartphone, Trash2, KeyRound, CheckCircle2, Info, X } from "lucide-react";

// --- CHANGE PASSWORD MODAL ---
export function ChangePasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!oldPass || !newPass) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSaving(true);
    try {
      await SettingsService.changePassword(oldPass, newPass);
      toast.success("Password updated successfully");
      onClose();
      setOldPass("");
      setNewPass("");
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-3xl p-0 bg-slate-50 flex flex-col h-[90vh] sm:h-auto sm:side-right sm:rounded-none">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <SheetTitle className="text-xl font-bold">Change Password</SheetTitle>
            <SheetDescription>Update your account security.</SheetDescription>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="size-5"/></button>
        </div>
        
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Current Password</label>
            <input 
              type="password" 
              value={oldPass} 
              onChange={e => setOldPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
            <input 
              type="password" 
              value={newPass} 
              onChange={e => setNewPass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none" 
            />
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 mt-auto">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2 hover:bg-emerald-600 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="size-5 animate-spin" /> : "Update Password"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- DEVICES MODAL ---
export function DevicesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutAll = async () => {
    setIsLoggingOut(true);
    await SettingsService.logoutFromAllDevices();
    setIsLoggingOut(false);
    toast.success("Successfully logged out from other devices");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-3xl p-0 bg-slate-50 flex flex-col max-h-[90vh]">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <SheetTitle className="text-xl font-bold">Active Sessions</SheetTitle>
            <SheetDescription>Manage devices logged into your account.</SheetDescription>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="size-5"/></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-emerald-50 text-emerald-600 rounded-full flex justify-center items-center">
                <Smartphone className="size-5" />
              </div>
              <div>
                <p className="font-bold text-sm">iPhone 14 Pro</p>
                <p className="text-xs text-slate-500">Noida, India • Active now</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">This Device</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-slate-100 text-slate-500 rounded-full flex justify-center items-center">
                <MonitorSmartphone className="size-5" />
              </div>
              <div>
                <p className="font-bold text-sm">MacBook Air M2</p>
                <p className="text-xs text-slate-500">Delhi, India • Last active 2h ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 mt-auto">
          <button 
            onClick={handleLogoutAll} 
            disabled={isLoggingOut}
            className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 flex justify-center items-center gap-2 hover:bg-red-100 transition-colors"
          >
            {isLoggingOut ? <Loader2 className="size-5 animate-spin" /> : "Logout from all other devices"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- STORAGE MODAL ---
export function StorageModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [clearCache, setClearCache] = useState(true);
  const [clearSearch, setClearSearch] = useState(true);
  const [clearViewed, setClearViewed] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    setIsClearing(true);
    await SettingsService.clearCache({ cache: clearCache, searchHistory: clearSearch, recentlyViewed: clearViewed });
    setIsClearing(false);
    toast.success("Storage cleared successfully");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-3xl p-0 bg-slate-50 flex flex-col max-h-[90vh]">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <SheetTitle className="text-xl font-bold">Storage & Data</SheetTitle>
            <SheetDescription>Manage app data to free up space.</SheetDescription>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="size-5"/></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-bold text-sm">App Cache (45 MB)</p>
              <p className="text-xs text-slate-500">Images and temporary files</p>
            </div>
            <input type="checkbox" checked={clearCache} onChange={e => setClearCache(e.target.checked)} className="size-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
          </label>

          <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-bold text-sm">Search History</p>
              <p className="text-xs text-slate-500">Your recent search queries</p>
            </div>
            <input type="checkbox" checked={clearSearch} onChange={e => setClearSearch(e.target.checked)} className="size-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
          </label>

          <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-50">
            <div>
              <p className="font-bold text-sm">Recently Viewed</p>
              <p className="text-xs text-slate-500">Products you've browsed recently</p>
            </div>
            <input type="checkbox" checked={clearViewed} onChange={e => setClearViewed(e.target.checked)} className="size-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
          </label>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 mt-auto">
          <button 
            onClick={handleClear} 
            disabled={isClearing || (!clearCache && !clearSearch && !clearViewed)}
            className="w-full py-3.5 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 flex justify-center items-center gap-2 hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {isClearing ? <Loader2 className="size-5 animate-spin" /> : <><Trash2 className="size-5"/> Clear Selected Data</>}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- ABOUT MODAL ---
export function AboutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="sm:max-w-md mx-auto rounded-t-3xl p-0 bg-slate-50 flex flex-col">
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div>
            <SheetTitle className="text-xl font-bold">About App</SheetTitle>
            <SheetDescription>Version and legal info.</SheetDescription>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="size-5"/></button>
        </div>

        <div className="p-6 flex flex-col items-center justify-center py-10 bg-white">
          <div className="size-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-4 border border-emerald-100 shadow-sm">
            <Info className="size-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Himanshu Store</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Version 1.0.0 (Build 405)</p>
          <p className="text-xs text-slate-400 mt-6">© 2026 Himanshu Store. All rights reserved.</p>
        </div>

        <div className="p-4 space-y-2 bg-slate-50">
          <button className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50">Terms of Service</button>
          <button className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50">Privacy Policy</button>
          <button className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50">Open Source Licenses</button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
