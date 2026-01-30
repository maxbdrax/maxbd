
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  password?: string;
  balance: number;
  commission: number;
  bonusBalance: number; 
  role: UserRole;
  avatar: string;
  phone?: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  createdAt: string; // Changed to string for ISO format
  requiredTurnover: number;
  currentTurnover: number;
}

export interface Transaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string; // Changed to string for ISO format
  method: 'bKash' | 'Nagad' | 'Rocket';
  accountNumber?: string;
  transactionId?: string;
}

export interface BetRecord {
  id: string;
  userId: string;
  gameTitle: string;
  amount: number;
  winAmount: number;
  status: 'WIN' | 'LOSS' | 'PENDING';
  details: string;
  timestamp: string; // Changed to string for ISO format
}

export interface Match {
  id: string;
  title: string;
  teamA: string;
  teamB: string;
  oddsA: number;
  oddsB: number;
  status: 'OPEN' | 'CLOSED' | 'RESOLVED';
  winner?: string;
  timestamp: string; // Changed to string for ISO format
}

export interface AdminSettings {
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  minDeposit: number;
  minWithdraw: number;
  referralCommission: number; 
  depositBonusPercent: number; 
  globalClaimBonus: number; 
}

export interface Game {
  id: string;
  title: string;
  provider: string;
  image: string;
  category: 'SLOTS' | 'LOTTERY' | 'LIVE' | 'CRASH' | 'MATCH';
}

export enum GameAction {
  RED = 'RED',
  GREEN = 'GREEN',
  BIG = 'BIG',
  SMALL = 'SMALL'
}
