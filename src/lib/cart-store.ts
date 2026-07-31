import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

export type CartLine = {
  product: Product;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  isDrawerOpen: boolean;
  latestAddedProduct: Product | null;
  cartPulse: number;
  appliedCoupon: { code: string; discountAmount: number } | null;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  triggerPulse: () => void;
  setAppliedCoupon: (coupon: { code: string; discountAmount: number } | null) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isDrawerOpen: false,
      latestAddedProduct: null,
      cartPulse: 0,
      appliedCoupon: null,
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product.id === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.product.id === product.id ? { ...l, qty: l.qty + qty } : l,
              ),
              latestAddedProduct: product,
            };
          }
          return { 
            lines: [...state.lines, { product, qty }],
            latestAddedProduct: product,
          };
        }),
      remove: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.product.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.product.id !== id)
              : state.lines.map((l) => (l.product.id === id ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [], latestAddedProduct: null, appliedCoupon: null }),
      setIsDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      triggerPulse: () => set((state) => ({ cartPulse: state.cartPulse + 1 })),
      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
    }),
    { name: "zest-cart" },
  ),
);

export function selectCartCount(state: CartState) {
  return state.lines.reduce((n, l) => n + l.qty, 0);
}

export function selectCartSubtotal(state: CartState) {
  return state.lines.reduce((n, l) => n + l.qty * l.product.price, 0);
}
