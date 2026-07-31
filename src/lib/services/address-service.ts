import { supabase } from '@/integrations/supabase/client';

export interface SavedAddress {
  id: string;
  type: "Home" | "Work" | "Other";
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
  coordinates?: [number, number];
}

// Map from db to frontend type
function mapAddress(dbAddr: any): SavedAddress {
  return {
    id: dbAddr.id,
    type: dbAddr.type as any,
    recipientName: dbAddr.recipient_name,
    phone: dbAddr.phone,
    line1: dbAddr.line1,
    line2: dbAddr.line2,
    city: dbAddr.city,
    state: dbAddr.state,
    pinCode: dbAddr.pin_code,
    isDefault: dbAddr.is_default,
    coordinates: dbAddr.coordinates
  };
}

// Fallback logic for when Supabase tables are unavailable
function getFallbackAddresses(): SavedAddress[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('mock_addresses');
    if (saved) return JSON.parse(saved);
  }
  return [
    {
      id: "mock-1",
      type: "Home",
      recipientName: "Demo User",
      phone: "+91 9876543210",
      line1: "123, Fresh Valley Appts",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400001",
      isDefault: true
    }
  ];
}

function saveFallbackAddresses(addrs: SavedAddress[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_addresses', JSON.stringify(addrs));
  }
}

export const AddressService = {
  async getAddresses(): Promise<SavedAddress[]> {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (error || !data) {
      console.warn('Fallback to local addresses due to DB error');
      return getFallbackAddresses();
    }
    
    return data.map(mapAddress);
  },

  async addAddress(addr: Omit<SavedAddress, "id">): Promise<SavedAddress> {
    if (addr.isDefault) {
      const { error: resetErr } = await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (resetErr) console.warn("Could not reset default addresses in DB");
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert({
        type: addr.type,
        recipient_name: addr.recipientName,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        pin_code: addr.pinCode,
        is_default: addr.isDefault,
        coordinates: addr.coordinates
      })
      .select()
      .single();

    if (error) {
      console.warn('Fallback: saving to local addresses');
      const all = getFallbackAddresses();
      if (addr.isDefault) {
        all.forEach(a => a.isDefault = false);
      }
      const newAddr = { ...addr, id: "mock-" + Date.now() } as SavedAddress;
      if (all.length === 0) newAddr.isDefault = true;
      all.unshift(newAddr); // Add to top
      saveFallbackAddresses(all);
      return newAddr;
    }
    
    // DB Fallback logic if it's the very first address
    if (!addr.isDefault) {
      const all = await this.getAddresses();
      if (all.length === 1) {
        await this.setDefault(all[0].id);
        all[0].isDefault = true;
        return all[0];
      }
    }

    return mapAddress(data);
  },

  async updateAddress(id: string, updates: Partial<Omit<SavedAddress, "id">>): Promise<SavedAddress> {
    if (id.startsWith('mock-')) {
      const all = getFallbackAddresses();
      if (updates.isDefault) {
        all.forEach(a => a.isDefault = false);
      }
      const idx = all.findIndex(a => a.id === id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...updates };
        saveFallbackAddresses(all);
        return all[idx];
      }
      throw new Error("Local address not found");
    }

    if (updates.isDefault) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .neq('id', id);
    }

    const dbUpdates: any = {};
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.recipientName !== undefined) dbUpdates.recipient_name = updates.recipientName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.line1 !== undefined) dbUpdates.line1 = updates.line1;
    if (updates.line2 !== undefined) dbUpdates.line2 = updates.line2;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.pinCode !== undefined) dbUpdates.pin_code = updates.pinCode;
    if (updates.isDefault !== undefined) dbUpdates.is_default = updates.isDefault;
    if (updates.coordinates !== undefined) dbUpdates.coordinates = updates.coordinates;

    const { data, error } = await supabase
      .from('customer_addresses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapAddress(data);
  },

  async deleteAddress(id: string): Promise<void> {
    if (id.startsWith('mock-')) {
      const all = getFallbackAddresses();
      const wasDefault = all.find(a => a.id === id)?.isDefault;
      const remaining = all.filter(a => a.id !== id);
      if (wasDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      saveFallbackAddresses(remaining);
      return;
    }

    const list = await this.getAddresses();
    const wasDefault = list.find(a => a.id === id)?.isDefault;

    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const remaining = list.filter(a => a.id !== id);
    if (wasDefault && remaining.length > 0) {
      await this.setDefault(remaining[0].id);
    }
  },

  async setDefault(id: string): Promise<void> {
    await this.updateAddress(id, { isDefault: true });
  }
};
