import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tier = 'Green' | 'Fresh' | 'Gold' | 'Platinum';

export interface RewardTransaction {
  id: string;
  type: 'earn' | 'redeem';
  amount: number;
  date: string;
  description: string;
}

export interface RewardsState {
  points: number;
  lifetimePoints: number;
  activeTier: Tier;
  highestUnlockedTier: Tier;
  streak: number;
  lastCheckIn: string | null;
  history: RewardTransaction[];
  unlockedBadges: string[];
  spinAvailable: boolean;
  
  // Actions
  addPoints: (amount: number, description: string) => void;
  redeemPoints: (amount: number, description: string) => boolean;
  checkIn: () => { success: boolean; bonus: number; streak: number; message: string };
  unlockBadge: (badgeId: string) => void;
  playSpin: () => number;
  activateTier: (tier: Tier) => void;
}

const getTierFromPoints = (points: number): Tier => {
  if (points >= 10000) return 'Platinum';
  if (points >= 5000) return 'Gold';
  if (points >= 1000) return 'Fresh';
  return 'Green';
};

const isYesterday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

const isToday = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const useRewardsStore = create<RewardsState>()(
  persist(
    (set, get) => ({
      points: 250, // Starting bonus
      lifetimePoints: 250,
      activeTier: 'Green',
      highestUnlockedTier: 'Green',
      streak: 0,
      lastCheckIn: null,
      history: [
        {
          id: 'init-1',
          type: 'earn',
          amount: 250,
          date: new Date().toISOString(),
          description: 'Welcome Bonus',
        }
      ],
      unlockedBadges: ['first-order'],
      spinAvailable: true,

      addPoints: (amount, description) => {
        set((state) => {
          const newLifetime = state.lifetimePoints + amount;
          return {
            points: state.points + amount,
            lifetimePoints: newLifetime,
            highestUnlockedTier: getTierFromPoints(newLifetime),
            history: [
              {
                id: Math.random().toString(36).substring(7),
                type: 'earn',
                amount,
                date: new Date().toISOString(),
                description,
              },
              ...state.history,
            ],
          };
        });
      },

      redeemPoints: (amount, description) => {
        const state = get();
        if (state.points < amount) return false;

        set((state) => ({
          points: state.points - amount,
          history: [
            {
              id: Math.random().toString(36).substring(7),
              type: 'redeem',
              amount,
              date: new Date().toISOString(),
              description,
            },
            ...state.history,
          ],
        }));
        return true;
      },

      checkIn: () => {
        const state = get();
        const todayStr = new Date().toISOString();
        
        if (state.lastCheckIn && isToday(state.lastCheckIn)) {
          return { success: false, bonus: 0, streak: state.streak, message: 'Already checked in today!' };
        }

        let newStreak = 1;
        if (state.lastCheckIn && isYesterday(state.lastCheckIn)) {
          newStreak = state.streak + 1;
        }

        // Base points for check-in
        let bonus = 10; 
        let message = 'Daily Check-in';

        const streakDay = ((newStreak - 1) % 7) + 1; // 1 to 7
        if (streakDay === 7) {
          bonus = 100;
          message = '7-Day Streak Bonus!';
        } else {
          bonus = streakDay * 10;
          message = `Day ${streakDay} Check-in`;
        }

        set((state) => {
          const newLifetime = state.lifetimePoints + bonus;
          return {
            lastCheckIn: todayStr,
            streak: newStreak,
            points: state.points + bonus,
            lifetimePoints: newLifetime,
            highestUnlockedTier: getTierFromPoints(newLifetime),
            history: [
              {
                id: Math.random().toString(36).substring(7),
                type: 'earn',
                amount: bonus,
                date: todayStr,
                description: message,
              },
              ...state.history,
            ]
          };
        });

        return { success: true, bonus, streak: newStreak, message };
      },

      unlockBadge: (badgeId) => {
        set((state) => {
          if (state.unlockedBadges.includes(badgeId)) return state;
          return {
            unlockedBadges: [...state.unlockedBadges, badgeId]
          };
        });
      },

      playSpin: () => {
        const state = get();
        if (!state.spinAvailable) return 0;

        const prizes = [10, 50, 10, 100, 10, 0, 500, 0];
        const win = prizes[Math.floor(Math.random() * prizes.length)];
        
        set((state) => {
          const newState: Partial<RewardsState> = { spinAvailable: false };
          if (win > 0) {
             newState.points = state.points + win;
             newState.lifetimePoints = state.lifetimePoints + win;
             newState.highestUnlockedTier = getTierFromPoints(newState.lifetimePoints);
             newState.history = [
               {
                 id: Math.random().toString(36).substring(7),
                 type: 'earn',
                 amount: win,
                 date: new Date().toISOString(),
                 description: 'Lucky Spin Winner',
               },
               ...state.history,
             ];
          }
          return newState;
        });
        
        return win;
      },

      activateTier: (tier) => set({ activeTier: tier })
    }),
    {
      name: 'grocery-rewards-storage',
    }
  )
);
