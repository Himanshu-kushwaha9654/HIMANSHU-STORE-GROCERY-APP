// Simulated Spring Boot backend service for Profile
import { AuthService } from "./auth-service";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  memberSince: string;
  avatarDataUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  dob?: string;
  gender?: string;
  alternatePhone?: string;
}

const DEFAULT_PROFILE: UserProfile = {
  id: "11111111-1111-1111-1111-111111111111",
  fullName: "Himanshu Kushwaha",
  email: "himanshu@example.com",
  phone: "+91 9876543210",
  memberSince: "2024-01-15T00:00:00.000Z",
  avatarDataUrl: null,
  emailVerified: true,
  phoneVerified: false,
};

const STORAGE_KEY = "grocery_profile_v1";

export const ProfileService = {
  async getProfile(): Promise<UserProfile> {
    await delay(300);
    const session = AuthService.getSession();
    
    let storedProfile = DEFAULT_PROFILE;
    const storedStr = localStorage.getItem(STORAGE_KEY);
    if (storedStr) {
      storedProfile = JSON.parse(storedStr);
      // Fix legacy invalid UUIDs from old localStorage
      if (storedProfile.id === "u-1001" || !storedProfile.id.includes("-")) {
        storedProfile.id = "11111111-1111-1111-1111-111111111111";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedProfile));
      }
    }
    
    if (session && session.loginId) {
      if (session.loginId.includes('@')) {
        storedProfile.email = session.loginId;
      } else {
        storedProfile.phone = session.loginId;
      }
      if (session.fullName && session.fullName !== "User") {
        storedProfile.fullName = session.fullName;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedProfile));
    } else if (!storedStr) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
    }
    
    return storedProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    // Simulated Spring Boot API Call
    try {
      // In a real app:
      // await fetch("http://localhost:8080/api/v1/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(updates)
      // });
      await delay(500);
    } catch (e) {
      console.error("Backend fetch failed, falling back to local DB", e);
    }

    const current = await this.getProfile();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async verifyOtp(type: 'email' | 'phone', otp: string): Promise<boolean> {
    await delay(600);
    // Simulate any 4-digit OTP is valid except 0000
    if (otp === '0000') throw new Error("Invalid OTP");
    return true;
  },

  async updateAvatar(dataUrl: string | null): Promise<UserProfile> {
    return this.updateProfile({ avatarDataUrl: dataUrl });
  },

  async logout(): Promise<void> {
    await delay(800);
    // In a real app, clear auth tokens here.
    // For this simulation, we leave the local storage profile so it's not totally lost,
    // but a real app would destroy the session cookie.
  }
};
