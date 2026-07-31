// Abstracted Wishlist Service to simulate Backend API readiness.
// Currently uses localStorage.

export interface WishlistItem {
  productId: string;
  addedAt: number;
}

export interface WishlistCollection {
  id: string;
  name: string;
  productIds: string[];
  createdAt: number;
}

export interface WishlistData {
  items: WishlistItem[];
  collections: WishlistCollection[];
}

const STORAGE_KEY = 'wishlist-api-storage';

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const readStorage = (): WishlistData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to read wishlist storage', e);
  }
  return { items: [], collections: [] };
};

const writeStorage = (data: WishlistData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write wishlist storage', e);
  }
};

export const WishlistService = {
  /** GET /api/wishlist */
  getWishlist: async (): Promise<WishlistData> => {
    // await delay(300);
    return readStorage();
  },

  /** POST /api/wishlist/items */
  addItem: async (productId: string): Promise<WishlistData> => {
    // await delay(200);
    const data = readStorage();
    if (!data.items.find(i => i.productId === productId)) {
      data.items.push({ productId, addedAt: Date.now() });
      writeStorage(data);
    }
    return data;
  },

  /** DELETE /api/wishlist/items/:id */
  removeItem: async (productId: string): Promise<WishlistData> => {
    // await delay(200);
    const data = readStorage();
    data.items = data.items.filter(i => i.productId !== productId);
    
    // Also remove from any collections
    data.collections = data.collections.map(c => ({
      ...c,
      productIds: c.productIds.filter(id => id !== productId)
    }));
    
    writeStorage(data);
    return data;
  },

  /** POST /api/wishlist/collections */
  createCollection: async (name: string): Promise<WishlistData> => {
    const data = readStorage();
    const newCollection: WishlistCollection = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name,
      productIds: [],
      createdAt: Date.now()
    };
    data.collections.push(newCollection);
    writeStorage(data);
    return data;
  },

  /** POST /api/wishlist/collections/:id/items */
  addToCollection: async (collectionId: string, productId: string): Promise<WishlistData> => {
    const data = readStorage();
    const collection = data.collections.find(c => c.id === collectionId);
    if (collection && !collection.productIds.includes(productId)) {
      collection.productIds.push(productId);
      
      // Ensure it's also in the main items list
      if (!data.items.find(i => i.productId === productId)) {
        data.items.push({ productId, addedAt: Date.now() });
      }
      writeStorage(data);
    }
    return data;
  },
  
  /** DELETE /api/wishlist/collections/:id/items/:productId */
  removeFromCollection: async (collectionId: string, productId: string): Promise<WishlistData> => {
    const data = readStorage();
    const collection = data.collections.find(c => c.id === collectionId);
    if (collection) {
      collection.productIds = collection.productIds.filter(id => id !== productId);
      writeStorage(data);
    }
    return data;
  }
};
