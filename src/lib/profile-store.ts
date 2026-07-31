import { create } from 'zustand';
import { UserProfile, ProfileService } from './services/profile-service';

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (updated: UserProfile) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: true,
  fetchProfile: async () => {
    set({ loading: true });
    try {
      const profile = await ProfileService.getProfile();
      set({ profile, loading: false });
    } catch (e) {
      console.error("Failed to fetch profile", e);
      set({ loading: false });
    }
  },
  updateProfile: (updated) => {
    set({ profile: updated });
  }
}));

// Initialize immediately
if (typeof window !== 'undefined') {
  useProfileStore.getState().fetchProfile();
}
