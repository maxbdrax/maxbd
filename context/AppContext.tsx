
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, AdminSettings, BetRecord, Match } from '../types';
import { supabase } from '../services/supabase';

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

  const fetchUserData = async (userId: string) => {
    try {
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', userId)
        .order('timestamp', { ascending: false });
      if (txData) setTransactions(txData);
    } catch (e) {
      console.error("User data fetch error:", e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const { data: userData } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
      if (userData) setUsers(userData);
      const { data: txData } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
      if (txData) setTransactions(txData);
    } catch (e) {
      console.error("Admin data fetch error:", e);
    }
  };

  useEffect(() => {
    const failsafe = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    const initApp = async () => {
      try {
        const { data: settingsData } = await supabase.from('admin_settings').select('*').maybeSingle();
        if (settingsData) setAdminSettings(settingsData);
        else await supabase.from('admin_settings').insert([DEFAULT_SETTINGS]);

        const { data: matchData } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
        if (matchData) setMatches(matchData);

        const savedUser = localStorage.getItem('cv_user_session');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const { data: userData } = await supabase.from('users').select('*').eq('id', parsed.id).maybeSingle();
          if (userData) {
            setCurrentUser(userData);
            if (userData.role === 'ADMIN') {
              fetchAdminData();
            } else {
              fetchUserData(userData.id);
            }
          } else {
            localStorage.removeItem('cv_user_session');
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        clearTimeout(failsafe);
        setIsLoading(false);
      }
    };
    initApp();
  }, []);

  const login = async (username: string, password?: string) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password || '123456')
        .maybeSingle();

      if (error) return { success: false, message: "Database error: " + error.message };
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('cv_user_session', JSON.stringify(user));
        if (user.role === 'ADMIN') fetchAdminData();
        else fetchUserData(user.id);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: "Invalid username or password" };
    } catch (err: any) {
      return { success: false, message: "Server connection failed" };
    }
  };

  const signup = async (username: string, password?: string, phone?: string, referralCode?: string, adminSecret?: string) => {
    try {
      const { data: existing, error: checkError } = await supabase.from('users').select('username').eq('username', username).maybeSingle();
      if (checkError) return { success: false, message: "Connection error: " + checkError.message };
      if (existing) return { success: false, message: "Username already exists" };

      const role = (adminSecret === 'CV666_ADMIN_SEC') ? 'ADMIN' : 'USER';
      const newUser = {
        username,
        password: password || '123456',
        balance: role === 'ADMIN' ? 999999 : 0,
        commission: 0,
        bonusBalance: 0,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        referralCount: 0,
        createdAt: new Date().toISOString(),
        requiredTurnover: 0,
        currentTurnover: 0,
        phone
      };

      const { data, error } = await supabase.from('users').insert([newUser]).select().single();
      if (error) return { success: false, message: "Signup failed: " + error.message };

      if (data) {
        setCurrentUser(data);
        localStorage.setItem('cv_user_session', JSON.stringify(data));
        return { success: true, message: "Account created successfully" };
      }
      return { success: false, message: "Signup failed" };
    } catch (err: any) {
      return { success: false, message: "Unknown error occurred" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setTransactions([]);
    localStorage.removeItem('cv_user_session');
  };

  const refreshBalance = async () => {
    if (!currentUser) return;
    try {
      const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
      if (data) {
        setCurrentUser(data);
        if (data.role !== 'ADMIN') fetchUserData(data.id);
      }
    } catch (e) {
      console.error("Refresh error", e);
    }
  };

  const requestDeposit = async (method: any, amount: number, txId: string) => {
    if (!currentUser) return;
    await supabase.from('transactions').insert([{
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      method,
      transactionId: txId,
      timestamp: new Date().toISOString(),
    }]);
    if (currentUser.role === 'ADMIN') fetchAdminData();
    else fetchUserData(currentUser.id);
  };

  const requestWithdraw = async (method: any, amount: number, accountNumber: string) => {
    if (!currentUser || currentUser.balance < amount) return;
    await supabase.from('transactions').insert([{
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'WITHDRAW',
      status: 'PENDING',
      method,
      accountNumber,
      timestamp: new Date().toISOString(),
    }]);
    if (currentUser.role === 'ADMIN') fetchAdminData();
    else fetchUserData(currentUser.id);
  };

  const updateTransactionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (!tx || tx.status !== 'PENDING') return;

    if (status === 'APPROVED') {
      const { data: user } = await supabase.from('users').select('*').eq('id', tx.userId).single();
      if (user) {
        let newBalance = Number(user.balance);
        let newTurnover = Number(user.requiredTurnover);
        if (tx.type === 'DEPOSIT') {
          const bonus = (Number(tx.amount) * Number(adminSettings.depositBonusPercent)) / 100;
          newBalance += (Number(tx.amount) + bonus);
          newTurnover += Number(tx.amount);
        } else {
          newBalance -= Number(tx.amount);
        }
        await supabase.from('users').update({ balance: newBalance, requiredTurnover: newTurnover }).eq('id', tx.userId);
      }
    }
    await supabase.from('transactions').update({ status }).eq('id', id);
    if (currentUser?.role === 'ADMIN') fetchAdminData();
    else if (currentUser) fetchUserData(currentUser.id);
    refreshBalance();
  };

  const addBetRecord = async (userId: string, gameTitle: string, amount: number, winAmount: number, status: any, details: string) => {
    const { data } = await supabase.from('bet_history').insert([{
      userId, gameTitle, amount, winAmount, status, details, timestamp: new Date().toISOString()
    }]).select().single();
    if (currentUser) {
      await supabase.from('users').update({ 
        currentTurnover: Number(currentUser.currentTurnover) + Number(amount) 
      }).eq('id', userId);
      refreshBalance();
    }
    return data?.id || '';
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    await supabase.from('users').update({ balance: newBalance }).eq('id', userId);
    if (currentUser?.id === userId) refreshBalance();
    if (currentUser?.role === 'ADMIN') fetchAdminData();
  };

  const updateAdminSettings = async (settings: AdminSettings) => {
    await supabase.from('admin_settings').update(settings).eq('id', (settings as any).id || 1);
    setAdminSettings(settings);
  };

  const createMatch = async (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => {
    await supabase.from('matches').insert([{
      title, teamA, teamB, oddsA, oddsB, status: 'OPEN', timestamp: new Date().toISOString()
    }]);
    const { data } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
    if (data) setMatches(data);
  };

  const resolveMatch = async (id: string, winner: string) => {
    await supabase.from('matches').update({ status: 'RESOLVED', winner }).eq('id', id);
    const { data } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
    if (data) setMatches(data);
  };

  const deleteMatch = async (id: string) => {
    await supabase.from('matches').delete().eq('id', id);
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  const placeMatchBet = async (matchId: string, team: string, amount: number) => {
    if (!currentUser || currentUser.balance < amount) return false;
    const newBalance = Number(currentUser.balance) - Number(amount);
    await updateUserBalance(currentUser.id, newBalance);
    await addBetRecord(currentUser.id, 'Match Betting', amount, 0, 'PENDING', `Bet on ${team}`);
    return true;
  };

  const claimGlobalBonus = async () => {
    if (!currentUser) return;
    const bonus = Number(adminSettings.globalClaimBonus);
    await updateUserBalance(currentUser.id, Number(currentUser.balance) + bonus);
    alert(`Success! You claimed ৳${bonus} bonus.`);
  };

  const adminUpdateUser = async (id: string, updateData: any) => {
    await supabase.from('users').update(updateData).eq('id', id);
    fetchAdminData();
    if (currentUser?.id === id) refreshBalance();
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    fetchAdminData();
  };

  const fetchBetHistory = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from('bet_history').select('*').eq('userId', currentUser.id).order('timestamp', { ascending: false });
    if (data) setBetHistory(data);
  };

  const updateBetStatus = async () => {};
  const claimCommission = async () => {};
  const claimBonus = async () => {};
  const giveUserBonus = async () => {};

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
