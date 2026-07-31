import { useState } from 'react';
import { create } from 'zustand';

interface NavigationState {
  pageState: Record<string, any>;
  setPageState: (key: string, state: any) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  pageState: {},
  setPageState: (key, state) => set((prev) => ({
    pageState: { ...prev.pageState, [key]: state }
  })),
}));

export function usePersistedState<T>(key: string, initialValue: T): [T, (val: T) => void] {
  const { pageState, setPageState } = useNavigationStore();
  
  const [state, setState] = useState<T>(() => {
    const saved = pageState[key];
    return saved !== undefined ? saved : initialValue;
  });

  const setValue = (val: T) => {
    setState(val);
    setPageState(key, val);
  };

  return [state, setValue];
}
