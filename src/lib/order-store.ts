import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'Order Placed' | 'Payment Confirmed' | 'Preparing Order' | 'Packed' | 'Delivery Partner Assigned' | 'Out for Delivery' | 'Arriving Soon' | 'Delivered' | 'Cancelled' | 'Refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderPriceBreakdown {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  platformFee: number;
  couponDiscount: number;
  rewardPointsUsed: number;
  gst: number;
  total: number;
}

export interface OrderReview {
  rating: number; // 1-5
  comment?: string;
  date: string;
}

export interface Order {
  id: string;
  displayId: string; // e.g. #ORD-1234
  date: string; // ISO string
  status: OrderStatus;
  items: OrderItem[];
  priceBreakdown: OrderPriceBreakdown;
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  address: OrderAddress;
  review?: OrderReview;
  estimatedDelivery?: string; // ISO string
  deliveryPartner?: {
    name: string;
    phone: string;
    rating: number;
  };
}

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  rateOrder: (id: string, review: OrderReview) => void;
}

const demoAddress: OrderAddress = {
  name: "Himanshu Kushwaha",
  phone: "+91 98765 43210",
  street: "A-12, Green Valley Apartments, Sector 15",
  city: "Noida",
  state: "Uttar Pradesh",
  pincode: "201301"
};

const demoPartner = {
  name: "Rahul Sharma",
  phone: "+91 88888 99999",
  rating: 4.8
};

// Generate some demo orders
const initialOrders: Order[] = [
  {
    id: "ord-1",
    displayId: "#ORD-8829",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    status: "Out for Delivery",
    items: [
      { id: "item-1", productId: "p-1", name: "Organic Hass Avocado", price: 479, qty: 2, img: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&h=200&auto=format&fit=crop" },
      { id: "item-2", productId: "p-2", name: "Sourdough Bread Loaf", price: 519, qty: 1, img: "https://images.unsplash.com/photo-1585478259715-876a6a81fa08?w=200&h=200&auto=format&fit=crop" },
    ],
    priceBreakdown: { subtotal: 1477, discount: 0, deliveryCharge: 49, platformFee: 4, couponDiscount: 100, rewardPointsUsed: 0, gst: 73.85, total: 1503.85 },
    paymentMethod: "Apple Pay",
    paymentStatus: "Success",
    address: demoAddress,
    estimatedDelivery: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    deliveryPartner: demoPartner
  },
  {
    id: "ord-2",
    displayId: "#ORD-8828",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "Delivered",
    items: [
      { id: "item-3", productId: "p-3", name: "Oat Milk Barista Edition", price: 1199, qty: 1, img: "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=200&h=200&auto=format&fit=crop" },
      { id: "item-4", productId: "p-4", name: "Fresh Strawberries Box", price: 399, qty: 1, img: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=200&h=200&auto=format&fit=crop" },
    ],
    priceBreakdown: { subtotal: 1598, discount: 200, deliveryCharge: 0, platformFee: 4, couponDiscount: 0, rewardPointsUsed: 50, gst: 67.6, total: 1419.6 },
    paymentMethod: "UPI",
    paymentStatus: "Success",
    address: demoAddress,
    deliveryPartner: { name: "Vikas Kumar", phone: "+91 99999 88888", rating: 4.9 }
  },
  {
    id: "ord-3",
    displayId: "#ORD-8715",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    status: "Delivered",
    items: [
      { id: "item-5", productId: "p-5", name: "Premium Arabica Coffee Beans", price: 899, qty: 2, img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=200&h=200&auto=format&fit=crop" },
    ],
    priceBreakdown: { subtotal: 1798, discount: 100, deliveryCharge: 0, platformFee: 4, couponDiscount: 0, rewardPointsUsed: 0, gst: 85.1, total: 1787.1 },
    paymentMethod: "Credit Card",
    paymentStatus: "Success",
    address: demoAddress,
    review: { rating: 5, comment: "Excellent delivery speed!", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() }
  },
  {
    id: "ord-4",
    displayId: "#ORD-8502",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    status: "Cancelled",
    items: [
      { id: "item-6", productId: "p-6", name: "Almond Butter", price: 650, qty: 1, img: "https://images.unsplash.com/photo-1599818828345-d883bbfeb3a4?w=200&h=200&auto=format&fit=crop" },
    ],
    priceBreakdown: { subtotal: 650, discount: 0, deliveryCharge: 49, platformFee: 4, couponDiscount: 0, rewardPointsUsed: 0, gst: 32.5, total: 735.5 },
    paymentMethod: "UPI",
    paymentStatus: "Refunded",
    address: demoAddress,
  }
];

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: initialOrders,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
      rateOrder: (id, review) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, review } : o)
      }))
    }),
    {
      name: 'grocery-orders-storage',
    }
  )
);
