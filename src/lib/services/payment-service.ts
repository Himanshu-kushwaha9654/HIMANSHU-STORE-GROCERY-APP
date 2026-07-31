import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  type: "UPI" | "Card" | "Wallet" | "NetBanking";
  provider: string; // e.g. "Google Pay", "HDFC Bank", "Visa"
  details: string; // e.g. "himanshu@okicici", "**** **** **** 4242"
  iconUrl?: string;
  isDefault: boolean;
}

// Map from db to frontend type
function mapPaymentMethod(dbPm: any): PaymentMethod {
  return {
    id: dbPm.id,
    type: dbPm.type as any,
    provider: dbPm.provider,
    details: dbPm.details,
    iconUrl: dbPm.icon_url,
    isDefault: dbPm.is_default,
  };
}

export const PaymentService = {
  async getSavedMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('saved_payments')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
    
    return (data || []).map(mapPaymentMethod);
  },

  async addMethod(method: Omit<PaymentMethod, "id">): Promise<PaymentMethod> {
    if (method.isDefault) {
      await supabase
        .from('saved_payments')
        .update({ is_default: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // match all
    }

    const { data, error } = await supabase
      .from('saved_payments')
      .insert({
        type: method.type,
        provider: method.provider,
        details: method.details,
        icon_url: method.iconUrl,
        is_default: method.isDefault
      })
      .select()
      .single();

    if (error) throw error;
    
    // Fallback logic if it's the very first payment method, it should be default
    if (!method.isDefault) {
      const all = await this.getSavedMethods();
      if (all.length === 1) {
        await this.setDefault(all[0].id);
        all[0].isDefault = true;
        return all[0];
      }
    }

    return mapPaymentMethod(data);
  },

  async deleteMethod(id: string): Promise<void> {
    const list = await this.getSavedMethods();
    const wasDefault = list.find(m => m.id === id)?.isDefault;

    const { error } = await supabase
      .from('saved_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const remaining = list.filter(m => m.id !== id);
    if (wasDefault && remaining.length > 0) {
      await this.setDefault(remaining[0].id);
    }
  },

  async setDefault(id: string): Promise<void> {
    // Unset all first
    await supabase
      .from('saved_payments')
      .update({ is_default: false })
      .neq('id', id);

    // Set new default
    const { error } = await supabase
      .from('saved_payments')
      .update({ is_default: true })
      .eq('id', id);
      
    if (error) throw error;
  }
};
