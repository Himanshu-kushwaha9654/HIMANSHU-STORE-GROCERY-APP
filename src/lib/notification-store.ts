import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export type NotificationCategory = 
  | "ORDERS" 
  | "DELIVERY" 
  | "OFFERS" 
  | "COUPONS" 
  | "REWARDS" 
  | "WISHLIST" 
  | "STOCK" 
  | "AI_RECS" 
  | "ACCOUNT" 
  | "SECURITY"
  | "SYSTEM";

export interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationState {
  notifications: Notification[];
  archived: Notification[];
  deletedCache: Notification | null; // For Undo Delete
  add: (notification: Omit<Notification, "id" | "createdAt" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  undoDelete: () => void;
  archive: (id: string) => void;
  clearAll: () => void;
}

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "n-1",
    category: "DELIVERY",
    title: "Order Arriving Soon! 🛵",
    message: "Rahul is 2 mins away with your order #ORD-8829. Get ready!",
    isRead: false,
    createdAt: new Date().toISOString(), 
    actionUrl: "/tracking"
  },
  {
    id: "n-2",
    category: "COUPONS",
    title: "Unlocked: 50% Off! 🎉",
    message: "You just unlocked WELCOME50. Use it on your next grocery run.",
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
    actionUrl: "/coupons"
  },
  {
    id: "n-3",
    category: "WISHLIST",
    title: "Price Drop Alert! 📉",
    message: "Organic Hass Avocado is now 15% cheaper. Grab it before it's gone.",
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    actionUrl: "/wishlist"
  },
  {
    id: "n-4",
    category: "ORDERS",
    title: "Order Delivered Successfully",
    message: "Your order #ORD-8828 was delivered. Rate your experience to earn rewards.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    actionUrl: "/orders"
  },
  {
    id: "n-5",
    category: "REWARDS",
    title: "You Earned 50 Coins! 🪙",
    message: "Your daily check-in streak just earned you 50 Himanshu Coins.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
    actionUrl: "/rewards"
  },
  {
    id: "n-6",
    category: "SECURITY",
    title: "New Login Detected ⚠️",
    message: "We noticed a new login from a Windows device in New Delhi.",
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), // 8 days ago
  }
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEMO_NOTIFICATIONS,
      archived: [],
      deletedCache: null,
      
      add: (notification) => {
        const newNotif: Notification = {
          ...notification,
          id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: new Date().toISOString(),
          isRead: false,
        };
        set({ notifications: [newNotif, ...get().notifications] });
        toast("New notification received", {
          description: notification.title,
        });
      },
      
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
        toast.success("All caught up!");
      },
      
      deleteNotification: (id) => {
        const notifToDelete = get().notifications.find((n) => n.id === id);
        if (notifToDelete) {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
            deletedCache: notifToDelete,
          }));
          toast("Notification deleted", {
            action: {
              label: "Undo",
              onClick: () => get().undoDelete(),
            },
          });
        }
      },
      
      undoDelete: () => {
        const deleted = get().deletedCache;
        if (deleted) {
          set((state) => ({
            notifications: [deleted, ...state.notifications].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
            deletedCache: null,
          }));
          toast.success("Action undone");
        }
      },
      
      archive: (id) => {
        const notifToArchive = get().notifications.find((n) => n.id === id);
        if (notifToArchive) {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
            archived: [notifToArchive, ...state.archived],
          }));
          toast("Notification archived");
        }
      },
      
      clearAll: () => {
        set({ notifications: [], deletedCache: null });
        toast.success("All notifications cleared");
      },
    }),
    {
      name: "grocery-notifications",
    }
  )
);
