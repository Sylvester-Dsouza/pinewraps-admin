import { apiClient } from './client';

export interface UserReward {
  id: string;
  userId: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  history?: RewardHistory[];
}

export interface RewardHistory {
  id: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
  orderId?: string;
}

export interface RewardsAnalytics {
  totalPoints: number;
  activeUsers: number;
  totalRedemptions: number;
}

export const rewardsApi = {
  // Get all users with their rewards
  getAllUsersRewards: async () => {
    const response = await apiClient.get<{ success: boolean; data: UserReward[] }>(
      '/users/rewards'
    );
    return response.data;
  },

  // Get user rewards
  getUserRewards: async (userId: string) => {
    const response = await apiClient.get<{ success: boolean; data: UserReward }>(
      `/users/${userId}/rewards`
    );
    return response.data;
  },

  // Add points to user
  addPoints: async (data: {
    userId: string;
    points: number;
    description: string;
    orderId?: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; data: UserReward }>(
      `/users/${data.userId}/rewards/add`,
      data
    );
    return response.data;
  },

  // Get rewards analytics
  getRewardsAnalytics: async () => {
    const response = await apiClient.get<{ success: boolean; data: RewardsAnalytics }>(
      '/users/rewards/analytics'
    );
    return response.data;
  },
};
