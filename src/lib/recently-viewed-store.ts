import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
  items: string[];
  addViewed: (productId: string) => void;
  clear: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewed = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addViewed: (productId) => set((state) => {
        // Remove the item if it's already in the list so we can push it to the front
        const filtered = state.items.filter(id => id !== productId);
        // Add to the front
        const updated = [productId, ...filtered];
        // Truncate to MAX_ITEMS
        return { items: updated.slice(0, MAX_ITEMS) };
      }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
);
