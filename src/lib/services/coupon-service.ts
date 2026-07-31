const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue: number;
  status: "AVAILABLE" | "USED" | "EXPIRED";
  expiresAt: string;
}

const DEMO_COUPONS: Coupon[] = [
  {
    id: "c-1",
    code: "WELCOME50",
    title: "Flat 50% Off",
    description: "Up to ₹200 off on your first grocery order.",
    discountType: "PERCENT",
    discountValue: 50,
    minOrderValue: 299,
    status: "AVAILABLE",
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString() // 7 days from now
  },
  {
    id: "c-2",
    code: "HIMANSHU25",
    title: "Premium ₹100 Off",
    description: "Exclusive discount for premium members.",
    discountType: "FIXED",
    discountValue: 100,
    minOrderValue: 499,
    status: "AVAILABLE",
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
  },
  {
    id: "c-3",
    code: "DIWALI30",
    title: "Festival Bonanza",
    description: "Flat 30% off during the festive season.",
    discountType: "PERCENT",
    discountValue: 30,
    minOrderValue: 999,
    status: "EXPIRED",
    expiresAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

const STORAGE_KEY = "grocery_coupons_v1";

export const CouponService = {
  async getCoupons(): Promise<Coupon[]> {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COUPONS));
      return DEMO_COUPONS;
    }
    return JSON.parse(stored);
  },

  async applyCoupon(code: string, cartTotal: number): Promise<{ success: boolean; discountAmount: number; message: string }> {
    await delay(600);
    const list = await this.getCoupons();
    const coupon = list.find(c => c.code === code && c.status === "AVAILABLE");
    
    if (!coupon) {
      return { success: false, discountAmount: 0, message: "Invalid or expired coupon" };
    }
    
    if (cartTotal < coupon.minOrderValue) {
      return { success: false, discountAmount: 0, message: `Add ₹${coupon.minOrderValue - cartTotal} more to apply this coupon.` };
    }

    let discount = 0;
    if (coupon.discountType === "FIXED") {
      discount = coupon.discountValue;
    } else {
      discount = (cartTotal * coupon.discountValue) / 100;
      // Cap at reasonable amount if percentage
      if (discount > 500) discount = 500; 
    }

    return { success: true, discountAmount: discount, message: `Coupon applied successfully! You saved ₹${discount}` };
  },

  async markAsUsed(id: string): Promise<void> {
    const list = await this.getCoupons();
    const idx = list.findIndex(c => c.id === id);
    if (idx !== -1) {
      list[idx].status = "USED";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }
  }
};
