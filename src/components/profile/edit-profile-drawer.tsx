import { useState, useRef, useEffect } from "react";
import { UserProfile, ProfileService } from "@/lib/services/profile-service";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Camera, Mail, Phone, User, Calendar, RefreshCcw, ShieldCheck, X, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface EditProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function EditProfileDrawer({ isOpen, onClose, profile, onProfileUpdated }: EditProfileDrawerProps) {
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // OTP flow
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        dob: profile.dob || "",
        gender: profile.gender || "",
        alternatePhone: profile.alternatePhone || "",
      });
      setAvatarPreview(profile.avatarDataUrl);
      setShowPhoneOtp(false);
      setShowEmailOtp(false);
      setPhoneOtp("");
      setEmailOtp("");
    }
  }, [profile, isOpen]);

  const hasUnsavedChanges = () => {
    if (!profile) return false;
    return (
      formData.fullName !== profile.fullName ||
      formData.email !== profile.email ||
      formData.phone !== profile.phone ||
      formData.dob !== (profile.dob || "") ||
      formData.gender !== (profile.gender || "") ||
      formData.alternatePhone !== (profile.alternatePhone || "") ||
      avatarPreview !== profile.avatarDataUrl
    );
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      if (confirm("You have unsaved changes. Discard changes?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const validateIndianPhone = (phone: string) => {
    return /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone);
  };

  const handleSave = async () => {
    if (!formData.fullName || formData.fullName.trim().length === 0) {
      toast.error("Full Name cannot be empty");
      return;
    }
    if (formData.phone && !validateIndianPhone(formData.phone)) {
      toast.error("Please enter a valid Indian mobile number");
      return;
    }
    if (formData.alternatePhone && !validateIndianPhone(formData.alternatePhone)) {
      toast.error("Please enter a valid alternate mobile number");
      return;
    }

    setIsSaving(true);
    try {
      const updates = { ...formData };
      if (avatarPreview !== profile?.avatarDataUrl) {
        updates.avatarDataUrl = avatarPreview;
      }
      
      const updated = await ProfileService.updateProfile(updates);
      onProfileUpdated(updated);
      toast.success("Profile updated successfully.");
      onClose();
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sendPhoneOtp = async () => {
    if (!validateIndianPhone(formData.phone || "")) {
      toast.error("Valid Indian mobile number required for OTP");
      return;
    }
    setVerifyingPhone(true);
    await new Promise(r => setTimeout(r, 800));
    setVerifyingPhone(false);
    setShowPhoneOtp(true);
    toast.success("OTP sent to your phone");
  };

  const verifyPhoneOtp = async () => {
    try {
      setVerifyingPhone(true);
      await ProfileService.verifyOtp('phone', phoneOtp);
      setShowPhoneOtp(false);
      toast.success("Phone verified");
    } catch (e) {
      toast.error("Invalid OTP");
    } finally {
      setVerifyingPhone(false);
    }
  };

  if (!profile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#F8FAFC]">
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10 sticky top-0">
          <div>
            <SheetTitle className="text-xl font-bold text-[#1C1C1E]">Edit Profile</SheetTitle>
            <SheetDescription className="text-sm text-slate-500">
              Update your personal details.
            </SheetDescription>
          </div>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Avatar Section */}
          <div className="bg-white p-6 mb-2 border-b border-slate-100 flex flex-col items-center justify-center">
            <div 
              className="relative size-28 rounded-full bg-slate-100 border-4 border-white shadow-lg group cursor-pointer overflow-hidden flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center bg-emerald-100 text-emerald-600 text-3xl font-bold">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
                <Camera className="size-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium text-center max-w-[200px]">
              JPG, GIF or PNG. Max size of 5MB.
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange}
            />
          </div>

          <div className="p-6 flex flex-col gap-6">
            
            {/* Read Only Stats Area */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-wrap gap-y-4 shadow-sm">
              <div className="w-1/2">
                <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-1">User ID</p>
                <p className="text-sm font-semibold text-emerald-900 line-clamp-1 pr-2">{profile.id}</p>
              </div>
              <div className="w-1/2">
                <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mb-1">Joined</p>
                <p className="text-sm font-semibold text-emerald-900">{new Date(profile.memberSince).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Editable Form */}
            <div className="space-y-5">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Full Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="size-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName || ""}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="size-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setShowPhoneOtp(false); // Reset OTP flow if number changes
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>
                  {formData.phone !== profile.phone && !showPhoneOtp && (
                     <button 
                       type="button"
                       onClick={sendPhoneOtp}
                       disabled={verifyingPhone}
                       className="px-4 bg-slate-900 text-white rounded-xl text-xs font-bold whitespace-nowrap hover:bg-slate-800 disabled:opacity-50"
                     >
                       {verifyingPhone ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
                     </button>
                  )}
                </div>
                
                <AnimatePresence>
                  {showPhoneOtp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex gap-2 mt-2 overflow-hidden">
                      <input 
                        type="text" 
                        maxLength={4} 
                        placeholder="Enter 4-digit OTP" 
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="flex-1 py-2.5 px-4 bg-white border border-emerald-200 rounded-xl text-sm font-bold text-emerald-900 text-center tracking-widest outline-none focus:ring-2 focus:ring-emerald-500" 
                      />
                      <button 
                        type="button" 
                        onClick={verifyPhoneOtp}
                        disabled={verifyingPhone || phoneOtp.length !== 4}
                        className="px-4 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                      >
                        {verifyingPhone ? <Loader2 className="size-4 animate-spin" /> : "Submit"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="size-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="name@example.com"
                  />
                  {profile.emailVerified && formData.email === profile.email && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      <ShieldCheck className="size-4 text-emerald-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Date of Birth & Gender Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Date of Birth</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="size-4 text-slate-400" />
                    </div>
                    <input
                      type="date"
                      value={formData.dob || ""}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Gender</label>
                  <select
                    value={formData.gender || ""}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Alternate Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center justify-between">
                  Alternate Contact
                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">Optional</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="size-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.alternatePhone || ""}
                    onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#1C1C1E] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Friend or Family number"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t border-slate-100 grid grid-cols-2 gap-3 z-10 sticky bottom-0">
          <button 
            onClick={handleClose}
            className="py-3.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-95 text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="py-3.5 font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
