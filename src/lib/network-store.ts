import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
  setOnline: (status: boolean) => void;
  initialize: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  setOnline: (status) => set({ isOnline: status }),
  initialize: () => {
    if (typeof window !== "undefined") {
      const updateOnlineStatus = () => set({ isOnline: navigator.onLine });

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);

      // Cleanup function to be called if necessary
      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    }
  },
}));
