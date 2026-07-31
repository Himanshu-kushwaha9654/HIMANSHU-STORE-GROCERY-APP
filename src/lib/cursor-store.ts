import { create } from 'zustand';

type CursorVariant = 'default' | 'button' | 'product' | 'text' | 'hidden';

interface CursorState {
  variant: CursorVariant;
  text: string;
  isActive: boolean;
  setVariant: (variant: CursorVariant) => void;
  setText: (text: string) => void;
  setIsActive: (isActive: boolean) => void;
  reset: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  variant: 'default',
  text: '',
  isActive: true,
  setVariant: (variant) => set({ variant }),
  setText: (text) => set({ text }),
  setIsActive: (isActive) => set({ isActive }),
  reset: () => set({ variant: 'default', text: '' }),
}));
