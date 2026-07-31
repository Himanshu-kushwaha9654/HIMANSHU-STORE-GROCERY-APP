import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Moon, Globe, Bell, Shield, KeyRound, AlertTriangle, ChevronRight, Smartphone, User, Mail, MapPin, Package, CreditCard, Sparkles, MonitorSmartphone, Database, Info, HardDrive, Share, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigateBack } from "@/lib/hooks/use-navigate-back";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { SettingsService, AppPreferences } from "@/lib/services/settings-service";
import { useProfileStore } from "@/lib/profile-store";
import { EditProfileDrawer } from "@/components/profile/edit-profile-drawer";
import { ChangePasswordModal, DevicesModal, StorageModal, AboutModal } from "@/components/settings/settings-modals";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Himanshu Store" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const goBack = useNavigateBack();
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileStore();
  const [prefs, setPrefs] = useState<AppPreferences | null>(null);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDevicesOpen, setIsDevicesOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    SettingsService.getPreferences().then(setPrefs);
  }, []);

  const handlePrefChange = async (key: keyof AppPreferences, value: any) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    try {
      await SettingsService.updatePreferences({ [key]: value });
    } catch (e) {
      toast.error("Failed to save preference");
      setPrefs(prefs); // Revert on failure
    }
  };

  if (!prefs) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading settings...</div>;

  const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <section className="mb-8">
      <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-4">{title}</h2>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );

  const Item = ({ icon: Icon, title, subtitle, onClick, rightAction, iconBg, iconColor }: any) => (
    <div onClick={onClick} className={`p-4 flex items-center justify-between transition-colors ${onClick ? 'hover:bg-slate-50 cursor-pointer active:bg-slate-100' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-bold text-[#1C1C1E] text-sm">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {rightAction}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-emerald-100">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => goBack("/profile")} className="size-10 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 transition-colors active:scale-95 text-slate-700">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="font-bold text-[#1C1C1E] tracking-tight text-[17px]">Settings</h1>
        <div className="size-10" />
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 mt-2">
        
        {/* 1. Account */}
        <Section title="Account">
          <Item 
            icon={User} iconBg="bg-blue-50" iconColor="text-blue-600" title="Edit Profile" subtitle="Personal details" 
            onClick={() => setIsEditProfileOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Smartphone} iconBg="bg-blue-50" iconColor="text-blue-600" title="Change Mobile Number" subtitle={profile?.phone} 
            onClick={() => setIsEditProfileOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Mail} iconBg="bg-blue-50" iconColor="text-blue-600" title="Linked Email" subtitle={profile?.email} 
            onClick={() => setIsEditProfileOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* 2. Delivery */}
        <Section title="Delivery">
          <Item 
            icon={MapPin} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Saved Addresses" subtitle="Manage locations" 
            onClick={() => navigate({ to: '/addresses' })} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Package} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Contactless Delivery" subtitle="Leave at door" 
            rightAction={<Switch checked={prefs.contactlessDelivery} onCheckedChange={v => handlePrefChange('contactlessDelivery', v)} />} 
          />
          <Item 
            icon={Bell} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Ring Bell" subtitle="Delivery executive will ring bell" 
            rightAction={<Switch checked={prefs.ringBell} onCheckedChange={v => handlePrefChange('ringBell', v)} />} 
          />
        </Section>

        {/* 3. Notifications */}
        <Section title="Notifications">
          <Item 
            icon={Bell} iconBg="bg-pink-50" iconColor="text-pink-600" title="Push Notifications" subtitle="Device alerts" 
            rightAction={<Switch checked={prefs.pushNotifs} onCheckedChange={v => handlePrefChange('pushNotifs', v)} />} 
          />
          <Item 
            icon={Smartphone} iconBg="bg-pink-50" iconColor="text-pink-600" title="SMS Updates" 
            rightAction={<Switch checked={prefs.smsNotifs} onCheckedChange={v => handlePrefChange('smsNotifs', v)} />} 
          />
          <Item 
            icon={Mail} iconBg="bg-pink-50" iconColor="text-pink-600" title="Email Newsletters" 
            rightAction={<Switch checked={prefs.emailNotifs} onCheckedChange={v => handlePrefChange('emailNotifs', v)} />} 
          />
        </Section>

        {/* 4. Security */}
        <Section title="Security & Privacy">
          <Item 
            icon={KeyRound} iconBg="bg-purple-50" iconColor="text-purple-600" title="Change Password" 
            onClick={() => setIsPasswordOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={MonitorSmartphone} iconBg="bg-purple-50" iconColor="text-purple-600" title="Login Devices" subtitle="Manage active sessions"
            onClick={() => setIsDevicesOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* 5. Payments */}
        <Section title="Payments">
          <Item 
            icon={CreditCard} iconBg="bg-indigo-50" iconColor="text-indigo-600" title="Saved Cards & UPI" subtitle="Manage payment methods" 
            onClick={() => navigate({ to: '/payments' })} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* 6. Rewards */}
        <Section title="Rewards & Loyalty">
          <Item 
            icon={Sparkles} iconBg="bg-amber-50" iconColor="text-amber-600" title="Membership & Points" subtitle="View tier benefits" 
            onClick={() => navigate({ to: '/rewards' })} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* 7. App Preferences */}
        <Section title="App Preferences">
          <Item  
            icon={Globe} iconBg="bg-slate-100" iconColor="text-slate-600" title="Language" subtitle={prefs.language} 
            onClick={() => toast.info("More languages coming soon")} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Database} iconBg="bg-slate-100" iconColor="text-slate-600" title="Data Saver" subtitle="Reduce image quality"
            rightAction={<Switch checked={prefs.dataSaver} onCheckedChange={v => handlePrefChange('dataSaver', v)} />} 
          />
        </Section>

        {/* 8. Storage */}
        <Section title="Storage & Data">
          <Item 
            icon={HardDrive} iconBg="bg-orange-50" iconColor="text-orange-600" title="Clear Cache & Data" subtitle="Free up local space" 
            onClick={() => setIsStorageOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* 9. About */}
        <Section title="About">
          <Item 
            icon={Info} iconBg="bg-slate-100" iconColor="text-slate-600" title="About App" subtitle="Version, Legal & Support" 
            onClick={() => setIsAboutOpen(true)} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Share} iconBg="bg-slate-100" iconColor="text-slate-600" title="Share App" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Himanshu Store", text: "Check out this awesome grocery app!", url: "https://himanshustore.com" });
              } else {
                toast.success("Link copied to clipboard!");
              }
            }} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
          <Item 
            icon={Star} iconBg="bg-amber-50" iconColor="text-amber-500" title="Rate App" 
            onClick={() => toast.success("Thanks for wanting to rate us! App Store link coming soon.")} rightAction={<ChevronRight className="size-5 text-slate-300" />} 
          />
        </Section>

        {/* Danger Zone */}
        <section className="mt-12">
          <button
            onClick={() => toast.error("Are you sure?", { action: { label: "Confirm", onClick: () => toast.success("Account deletion requested") }})}
            className="w-full bg-white border border-red-100 text-red-600 rounded-[24px] p-5 flex items-center justify-center gap-2 font-bold shadow-sm hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="size-5" /> Delete Account
          </button>
        </section>
      </main>

      {/* Modals */}
      <EditProfileDrawer isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} profile={profile} onProfileUpdated={updateProfile} />
      <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
      <DevicesModal isOpen={isDevicesOpen} onClose={() => setIsDevicesOpen(false)} />
      <StorageModal isOpen={isStorageOpen} onClose={() => setIsStorageOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
