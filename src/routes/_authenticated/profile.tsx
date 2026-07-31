import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { 
  Loader2, LogOut, Camera, Heart, ShoppingBag, Sparkles, MapPin, 
  CreditCard, Ticket, Bell, Settings, HelpCircle, ChevronRight, Edit3, ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { ProfileService, UserProfile } from "@/lib/services/profile-service";
import { AddressService, SavedAddress } from "@/lib/services/address-service";
import { useRewardsStore } from "@/lib/rewards-store";
import { EditProfileDrawer } from "@/components/profile/edit-profile-drawer";
import { useProfileStore } from "@/lib/profile-store";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "My Account — Himanshu Store" }] }),
  component: ProfilePage,
});

const NAV_SECTIONS = [
  {
    title: "My Account",
    items: [
      { id: "orders", icon: ShoppingBag, title: "My Orders", subtitle: "Track, return, or buy again", link: "/orders", color: "text-blue-500", bg: "bg-blue-50" },
      { id: "wishlist", icon: Heart, title: "Wishlist", subtitle: "Your saved items", link: "/wishlist", color: "text-rose-500", bg: "bg-rose-50" },
      { id: "addresses", icon: MapPin, title: "Saved Addresses", subtitle: "Manage delivery locations", link: "/addresses", color: "text-emerald-500", bg: "bg-emerald-50" },
    ]
  },
  {
    title: "Offers & Rewards",
    items: [
      { id: "rewards", icon: Sparkles, title: "Rewards Hub", subtitle: "Check points and tier benefits", link: "/rewards", color: "text-amber-500", bg: "bg-amber-50" },
      { id: "coupons", icon: Ticket, title: "Coupons", subtitle: "View exclusive offers", link: "/coupons", color: "text-orange-500", bg: "bg-orange-50" },
    ]
  },
  {
    title: "Preferences",
    items: [
      { id: "payments", icon: CreditCard, title: "Payment Center", subtitle: "Manage cards & UPI", link: "/payments", color: "text-purple-500", bg: "bg-purple-50" },
      { id: "notifications", icon: Bell, title: "Notifications", subtitle: "Alerts & updates", link: "/notifications", color: "text-pink-500", bg: "bg-pink-50" },
      { id: "settings", icon: Settings, title: "Settings", subtitle: "App preferences", link: "/settings", color: "text-slate-500", bg: "bg-slate-50" },
    ]
  },
  {
    title: "Support",
    items: [
      { id: "help", icon: HelpCircle, title: "Help & Support", subtitle: "FAQs and contact", link: "/help", color: "text-indigo-500", bg: "bg-indigo-50" },
    ]
  }
];

function ProfilePage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { points, activeTier } = useRewardsStore();
  
  const { profile, loading: profileLoading, updateProfile } = useProfileStore();
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const addrs = await AddressService.getAddresses();
        setDefaultAddress(addrs.find(a => a.isDefault) || null);
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleAvatar(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const updated = await ProfileService.updateAvatar(dataUrl);
        updateProfile(updated);
        toast.success("Profile photo updated seamlessly!");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    try {
      await ProfileService.logout();
      toast.success("Logged out successfully");
      navigate({ to: "/", replace: true });
    } catch (err) {
      toast.error("Failed to logout");
    }
  }

  if (loading || profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const membershipName = activeTier ? activeTier.charAt(0).toUpperCase() + activeTier.slice(1) : "Premium";

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      
      {/* 
        ====================================================
        SLEEK HEADER SECTION (Blinkit/Zepto Style)
        ====================================================
      */}
      <div className="bg-white border-b border-slate-100 pt-8 pb-6 px-4 sm:px-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar Profile Photo */}
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                {profile.avatarDataUrl ? (
                  <img src={profile.avatarDataUrl} alt={profile.fullName} className="size-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-emerald-600">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
                
                {/* Overlay for hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="size-5 text-white" />
                </div>
              </div>
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                  <Loader2 className="size-4 animate-spin text-emerald-600" />
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }} />
            </div>
            
            {/* User Details */}
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                {profile.fullName}
                {profile.emailVerified && <ShieldCheck className="size-4 text-blue-500" />}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-slate-500 text-sm">{profile.phone}</p>
                <button 
                  onClick={() => setIsEditDrawerOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-100 transition-colors text-slate-500 active:scale-95 border border-transparent hover:border-slate-200"
                >
                  <Edit3 className="size-3" />
                  <span className="text-xs font-semibold">Edit</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex flex-col items-end mt-1">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600 border border-amber-100">
                <Sparkles className="size-3" /> {membershipName}
              </span>
              <span className="text-xs font-bold text-slate-500 mt-1">{points} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        ====================================================
        NAVIGATION LIST (Zepto / Blinkit Style Hub)
        ====================================================
      */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 ml-2">{section.title}</h3>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {section.items.map((action, i) => {
                const Icon = action.icon;
                const isLast = i === section.items.length - 1;
                
                return (
                  <Link key={action.id} to={action.link as any} className="block group">
                    <div className={`flex items-center p-4 transition-colors hover:bg-slate-50 ${!isLast ? 'border-b border-slate-100' : ''}`}>
                      <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${action.bg} ${action.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{action.title}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">{action.subtitle}</p>
                      </div>
                      <ChevronRight className="size-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout Section */}
        <div className="mt-8 mb-8 px-2">
          <button 
            onClick={handleLogout}
            className="w-full bg-white border border-slate-200 text-red-500 font-bold text-sm py-4 rounded-xl shadow-sm hover:bg-red-50 hover:border-red-100 transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
          
          <div className="text-center mt-12 mb-8">
            <p className="text-sm font-bold text-slate-400">Himanshu Store v1.0.0</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Made with ♥️ in India</p>
          </div>
        </div>

        <EditProfileDrawer 
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          profile={profile}
          onProfileUpdated={(updated) => updateProfile(updated)}
        />
      </div>
    </div>
  );
}
