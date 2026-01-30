import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, AdminSettings, BetRecord, Match } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  betHistory: BetRecord[];
  matches: Match[];
  adminSettings: AdminSettings;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<{success: boolean, message: string}>;
  signup: (username: string, password?: string, phone?: string, referralCode?: string, adminSecret?: string) => Promise<{success: boolean, message: string}>;
  logout: () => void;
  refreshBalance: () => void;
  fetchBetHistory: () => Promise<void>;
  requestDeposit: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, txId: string) => Promise<void>;
  requestWithdraw: (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, accountNumber: string) => Promise<void>;
  updateTransactionStatus: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  updateAdminSettings: (settings: AdminSettings) => Promise<void>;
  updateUserBalance: (userId: string, newBalance: number) => Promise<void>;
  giveUserBonus: (userId: string, amount: number) => Promise<void>;
  adminUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
  claimBonus: () => Promise<void>;
  claimGlobalBonus: () => Promise<void>;
  addBetRecord: (userId: string, gameTitle: string, amount: number, winAmount: number, status: 'WIN' | 'LOSS' | 'PENDING', details: string) => Promise<string>;
  updateBetStatus: (id: string, winAmount: number, status: 'WIN' | 'LOSS') => Promise<void>;
  createMatch: (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => Promise<void>;
  placeMatchBet: (matchId: string, team: string, amount: number) => Promise<boolean>;
  resolveMatch: (matchId: string, winnerTeam: string) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  claimCommission: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'cv666_demo_users',
  CURRENT_USER: 'cv666_demo_current_user',
  TRANSACTIONS: 'cv666_demo_transactions',
  BETS: 'cv666_demo_bets',
  MATCHES: 'cv666_demo_matches',
  SETTINGS: 'cv666_demo_settings'
};

const DEFAULT_SETTINGS: AdminSettings = {
  bkashNumber: '01700000000',
  nagadNumber: '01800000000',
  rocketNumber: '01900000000',
  minDeposit: 100,
  minWithdraw: 500,
  referralCommission: 2,
  depositBonusPercent: 10,
  globalClaimBonus: 50
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Data from LocalStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
        const savedCurrentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
        const savedTxs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
        const savedBets = JSON.parse(localStorage.getItem(STORAGE_KEYS.BETS) || '[]');
        const savedMatches = JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
        const savedSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));

        setUsers(savedUsers);
        setCurrentUser(savedCurrentUser);
        setTransactions(savedTxs);
        setBetHistory(savedBets);
        setMatches(savedMatches);
        setAdminSettings(savedSettings);
      } catch (e) {
        console.error("Load Data Error", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Save Data to LocalStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(betHistory));
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(adminSettings));
    }
  }, [currentUser, users, transactions, betHistory, matches, adminSettings, isLoading]);

  const login = async (username: string, password?: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && (!password || user.password === password)) {
      setCurrentUser(user);
      return { success: true, message: "Login successful" };
    }
    return { success: false, message: "Invalid username or password" };
  };

  const signup = async (username: string, password?: string, phone?: string, referralCode?: string, adminSecret?: string) => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: "Username already exists" };
    }

    const role = (adminSecret === 'CV666_ADMIN_SEC') ? 'ADMIN' : 'USER';
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password: password || '123456',
      balance: role === 'ADMIN' ? 999999 : 0,
      commission: 0,
      bonusBalance: 0,
      role: role as any,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
      referralCount: 0,
      createdAt: Date.now(),
      requiredTurnover: 0,
      currentTurnover: 0,
      phone
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: "Account created" };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const refreshBalance = () => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      if (updatedUser) setCurrentUser(updatedUser);
    }
  };

  const requestDeposit = async (method: any, amount: number, txId: string) => {
    if (!currentUser) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      method,
      transactionId: txId,
      timestamp: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const requestWithdraw = async (method: any, amount: number, accountNumber: string) => {
    if (!currentUser || currentUser.balance < amount) return;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'WITHDRAW',
      status: 'PENDING',
      method,
      accountNumber,
      timestamp: Date.now(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransactionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const txIndex = transactions.findIndex(t => t.id === id);
    if (txIndex === -1 || transactions[txIndex].status !== 'PENDING') return;

    const tx = transactions[txIndex];
    if (status === 'APPROVED') {
      const userIndex = users.findIndex(u => u.id === tx.userId);
      if (userIndex !== -1) {
        const updatedUsers = [...users];
        if (tx.type === 'DEPOSIT') {
          const bonus = (tx.amount * adminSettings.depositBonusPercent) / 100;
          updatedUsers[userIndex].balance += (tx.amount + bonus);
          updatedUsers[userIndex].requiredTurnover += tx.amount;
        } else {
          updatedUsers[userIndex].balance -= tx.amount;
        }
        setUsers(updatedUsers);
      }
    }

    const updatedTxs = [...transactions];
    updatedTxs[txIndex].status = status;
    setTransactions(updatedTxs);
    refreshBalance();
  };

  const addBetRecord = async (userId: string, gameTitle: string, amount: number, winAmount: number, status: any, details: string) => {
    const newBet: BetRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      gameTitle,
      amount,
      winAmount,
      status,
      details,
      timestamp: Date.now()
    };
    setBetHistory(prev => [newBet, ...prev]);
    return newBet.id;
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  };

  const updateAdminSettings = async (settings: AdminSettings) => setAdminSettings(settings);
  const createMatch = async (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => {
    const newMatch: Match = { id: Math.random().toString(36).substr(2, 9), title, teamA, teamB, oddsA, oddsB, status: 'OPEN', timestamp: Date.now() };
    setMatches(prev => [newMatch, ...prev]);
  };
  const resolveMatch = async (id: string, winner: string) => setMatches(prev => prev.map(m => m.id === id ? { ...m, status: 'RESOLVED', winner } : m));
  const deleteMatch = async (id: string) => setMatches(prev => prev.filter(m => m.id !== id));
  const placeMatchBet = async (matchId: string, team: string, amount: number) => {
    if (!currentUser || currentUser.balance < amount) return false;
    await updateUserBalance(currentUser.id, currentUser.balance - amount);
    await addBetRecord(currentUser.id, 'Match Betting', amount, 0, 'PENDING', `Bet on ${team}`);
    return true;
  };
  const claimGlobalBonus = async () => {
    if (!currentUser) return;
    const bonus = adminSettings.globalClaimBonus;
    await updateUserBalance(currentUser.id, currentUser.balance + bonus);
    alert(`Congratulations! You claimed ৳${bonus} demo bonus.`);
  };
  const claimCommission = async () => {};
  const claimBonus = async () => {};
  const giveUserBonus = async () => {};
  const adminUpdateUser = async (id: string, data: any) => setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  const deleteUser = async (id: string) => setUsers(prev => prev.filter(u => u.id !== id));
  const fetchBetHistory = async () => {};
  const updateBetStatus = async () => {};

  return (
    <AppContext.Provider value={{ 
      currentUser, users, transactions, betHistory, matches, adminSettings, isLoading,
      login, signup, logout, refreshBalance, fetchBetHistory, requestDeposit, requestWithdraw,
      updateTransactionStatus, updateAdminSettings, updateUserBalance,
      giveUserBonus, claimBonus, claimGlobalBonus, adminUpdateUser,
      addBetRecord, updateBetStatus, createMatch, placeMatchBet, resolveMatch, deleteMatch,
      claimCommission, deleteUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};