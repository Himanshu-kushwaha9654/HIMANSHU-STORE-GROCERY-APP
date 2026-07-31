import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

interface WishlistState {
  items: string[]; // Store product IDs
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (productId) => {
        const { items } = get();
        const exists = items.includes(productId);
        if (exists) {
          set({ items: items.filter((id) => id !== productId) });
          toast("Removed from wishlist");
        } else {
          set({ items: [...items, productId] });
          toast.success("Added to wishlist");
        }
      },
      has: (productId) => get().items.includes(productId),
      clear: () => set({ items: [] }),
    }),
    {
      name: "grocery-wishlist",
    }
  )
);
