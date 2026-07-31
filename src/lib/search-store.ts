import { create } from 'zustand';
import { persist } from 'zustand/middleware';interface SearchStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isAiShoppingOpen: boolean;
  setIsAiShoppingOpen: (isOpen: boolean) => void;
  toggleSearch: () => void;
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      isAiShoppingOpen: false,
      setIsAiShoppingOpen: (isAiShoppingOpen) => set({ isAiShoppingOpen }),
      toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),
      recentSearches: ["Amul Butter", "Fresh Paneer", "Oat Milk", "Brown Bread"], // Initial seed
      addRecentSearch: (query) => 
        set((state) => {
          const filtered = state.recentSearches.filter(q => q.toLowerCase() !== query.toLowerCase());
          return { recentSearches: [query, ...filtered].slice(0, 10) };
        }),
      removeRecentSearch: (query) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter(q => q !== query)
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
      recentlyViewed: [],
      addRecentlyViewed: (productId) => 
        set((state) => {
          const filtered = state.recentlyViewed.filter(id => id !== productId);
          return { recentlyViewed: [productId, ...filtered].slice(0, 10) };
        }),
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({ 
        recentSearches: state.recentSearches,
        recentlyViewed: state.recentlyViewed 
      }), // Only persist recent history
    }
  )
);
