import { create } from 'zustand';
import type { Product } from './enterprise-data';

interface QuickViewStore {
  activeProduct: Product | null;
  setActiveProduct: (product: Product | null) => void;
}

export const useQuickView = create<QuickViewStore>((set) => ({
  activeProduct: null,
  setActiveProduct: (product) => set({ activeProduct: product }),
}));
