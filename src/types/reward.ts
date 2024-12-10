export type RewardHistory = {
  id: string;
  customerId: string;
  points: number;
  type: 'EARNED' | 'REDEEMED';
  description: string;
  orderId?: string;
  createdAt: string;
};

export type CustomerReward = {
  id: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  history: RewardHistory[];
};
