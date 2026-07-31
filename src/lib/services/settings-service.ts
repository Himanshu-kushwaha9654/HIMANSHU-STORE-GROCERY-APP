const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export interface AppPreferences {
  language: string;
  dataSaver: boolean;
  reduceMotion: boolean;
  pushNotifs: boolean;
  smsNotifs: boolean;
  whatsappNotifs: boolean;
  emailNotifs: boolean;
  orderUpdates: boolean;
  offers: boolean;
  priceDropAlerts: boolean;
  wishlistAlerts: boolean;
  contactlessDelivery: boolean;
  ringBell: boolean;
}

const DEFAULT_PREFS: AppPreferences = {
  language: "English (US)",
  dataSaver: false,
  reduceMotion: false,
  pushNotifs: true,
  smsNotifs: false,
  whatsappNotifs: true,
  emailNotifs: true,
  orderUpdates: true,
  offers: true,
  priceDropAlerts: false,
  wishlistAlerts: true,
  contactlessDelivery: false,
  ringBell: true,
};

const STORAGE_KEY = "grocery_settings_v1";

export const SettingsService = {
  async getPreferences(): Promise<AppPreferences> {
    await delay(300);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PREFS));
      return DEFAULT_PREFS;
    }
    return JSON.parse(stored);
  },

  async updatePreferences(updates: Partial<AppPreferences>): Promise<AppPreferences> {
    await delay(400);
    const current = await this.getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  async clearCache(options: { cache: boolean; searchHistory: boolean; recentlyViewed: boolean }): Promise<void> {
    await delay(800);
    if (options.searchHistory) localStorage.removeItem("grocery_search_history_v1");
    if (options.recentlyViewed) localStorage.removeItem("grocery_recently_viewed_v1");
    if (options.cache) {
      // Simulate clearing app cache
      console.log("App cache cleared via backend simulation");
    }
  },

  async logoutFromAllDevices(): Promise<void> {
    await delay(1000);
    console.log("Logged out from all devices");
  },
  
  async changePassword(oldPass: string, newPass: string): Promise<void> {
    await delay(800);
    if (oldPass === newPass) throw new Error("New password must be different");
    // Simulate successful password change
  }
};
