import { create } from 'zustand';
import { AddressService, SavedAddress } from './services/address-service';

export interface AddressState {
  addresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  isLoading: boolean;
  isPickerOpen: boolean;
  editingAddress: SavedAddress | null;
  
  // Actions
  loadAddresses: () => Promise<void>;
  addAddress: (addr: Omit<SavedAddress, "id">) => Promise<SavedAddress | null>;
  updateAddress: (id: string, updates: Partial<Omit<SavedAddress, "id">>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  setIsPickerOpen: (open: boolean, address?: SavedAddress | null) => void;
}

export const useAddressStore = create<AddressState>()((set) => ({
  addresses: [],
  defaultAddress: null,
  isLoading: true,
  isPickerOpen: false,
  editingAddress: null,

  loadAddresses: async () => {
    set({ isLoading: true });
    try {
      const addresses = await AddressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress, isLoading: false });
    } catch (err) {
      console.error("Failed to load addresses", err);
      set({ isLoading: false });
    }
  },

  addAddress: async (addr) => {
    try {
      const newAddr = await AddressService.addAddress(addr);
      const addresses = await AddressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress });
      return newAddr;
    } catch (err) {
      console.error("Failed to add address", err);
      return null;
    }
  },

  updateAddress: async (id, updates) => {
    try {
      await AddressService.updateAddress(id, updates);
      const addresses = await AddressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress });
    } catch (err) {
      console.error("Failed to update address", err);
    }
  },

  deleteAddress: async (id) => {
    try {
      await AddressService.deleteAddress(id);
      const addresses = await AddressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress });
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  },

  setDefaultAddress: async (id) => {
    try {
      await AddressService.setDefault(id);
      const addresses = await AddressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;
      set({ addresses, defaultAddress });
    } catch (err) {
      console.error("Failed to set default address", err);
    }
  },

  setIsPickerOpen: (open, address = null) => {
    set({ isPickerOpen: open, editingAddress: address });
  }
}));
