
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

const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const ADMIN_SECRET_KEY = 'CV666_ADMIN_SEC'; 

const DEFAULT_SETTINGS: AdminSettings = {
  bkashNumber: '01700000000',
  nagadNumber: '01800000000',
  rocketNumber: '01900000000',
  minDeposit: 100,
  minWithdraw: 500,
  referralCommission: 2,
  depositBonusPercent: 0,
  globalClaimBonus: 0
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBetHistory = async () => {
    if (!currentUser) return;
    try {
      let query = supabase.from('bets').select('*').order('timestamp', { ascending: false });
      if (currentUser.role !== 'ADMIN') {
        query = query.eq('userId', currentUser.id);
      }
      const { data, error } = await query;
      if (data) setBetHistory(data);
      if (error) console.error("Error fetching bets:", error);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        const { data: settingsData } = await supabase.from('settings').select('*').single();
        if (settingsData) setAdminSettings(settingsData);

        const { data: matchesData } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
        if (matchesData) setMatches(matchesData);

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          if (profile) {
            setCurrentUser(profile);
            
            // Fetch relevant data based on role
            if (profile.role === 'ADMIN') {
              const { data: allUsers } = await supabase.from('profiles').select('*');
              if (allUsers) setUsers(allUsers);
              
              const { data: allTransactions } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
              if (allTransactions) setTransactions(allTransactions);

              const { data: allBets } = await supabase.from('bets').select('*').order('timestamp', { ascending: false });
              if (allBets) setBetHistory(allBets);
            } else {
              const { data: userTransactions } = await supabase.from('transactions').select('*').eq('userId', profile.id).order('timestamp', { ascending: false });
              if (userTransactions) setTransactions(userTransactions);

              const { data: userBets } = await supabase.from('bets').select('*').eq('userId', profile.id).order('timestamp', { ascending: false });
              if (userBets) setBetHistory(userBets);
            }
          }
        }
      } catch (err) {
        console.error("Supabase Init Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const login = async (username: string, password?: string) => {
    try {
      const email = `${username.toLowerCase().replace(/\s/g, '')}@cv666.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default_password'
      });

      if (error) return { success: false, message: error.message };
      if (!data.user) return { success: false, message: "User not found" };

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profile) {
        setCurrentUser(profile);
        // Refresh bets immediately
        let query = supabase.from('bets').select('*').order('timestamp', { ascending: false });
        if (profile.role !== 'ADMIN') query = query.eq('userId', profile.id);
        const { data: userBets } = await query;
        if (userBets) setBetHistory(userBets);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: "Profile loading failed" };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const signup = async (username: string, password?: string, phone?: string, referralCode?: string, adminSecret?: string) => {
    try {
      if (!password || password.length < 6) return { success: false, message: "Password must be at least 6 characters" };

      let role: 'USER' | 'ADMIN' = 'USER';
      if (adminSecret && adminSecret === ADMIN_SECRET_KEY) role = 'ADMIN';
      else if (adminSecret) return { success: false, message: "Invalid Admin Secret Key!" };

      const email = `${username.toLowerCase().replace(/\s/g, '')}@cv666.com`;
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) return { success: false, message: error.message };
      if (!data.user) return { success: false, message: "Signup failed" };

      let referredBy: string | undefined;
      if (referralCode) {
        const { data: referrer } = await supabase.from('profiles').select('id').eq('referralCode', referralCode).single();
        if (referrer) referredBy = referrer.id;
      }

      const newUser: User = {
        id: data.user.id,
        username,
        balance: role === 'ADMIN' ? 999999 : 0,
        commission: 0,
        bonusBalance: 0,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        referralCode: generateReferralCode(),
        referredBy,
        referralCount: 0,
        createdAt: Date.now(),
        requiredTurnover: 0,
        currentTurnover: 0,
        phone
      };

      await supabase.from('profiles').insert(newUser);
      if (referredBy) await supabase.rpc('increment_referral_count', { user_id: referredBy });

      setCurrentUser(newUser);
      setBetHistory([]);
      return { success: true, message: "Account created successfully" };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setBetHistory([]);
    setUsers([]);
    setTransactions([]);
  };

  const refreshBalance = async () => {
    if (!currentUser) return;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
    if (profile) setCurrentUser(profile);
    fetchBetHistory();
  };

  const requestDeposit = async (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, txId: string) => {
    if (!currentUser) return;
    const newTx = {
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      method,
      transactionId: txId,
      timestamp: Date.now(),
    };
    const { data } = await supabase.from('transactions').insert(newTx).select().single();
    if (data) setTransactions(prev => [data, ...prev]);
  };

  const requestWithdraw = async (method: 'bKash' | 'Nagad' | 'Rocket', amount: number, accountNumber: string) => {
    if (!currentUser || currentUser.balance < amount) return;
    const newTx = {
      userId: currentUser.id,
      username: currentUser.username,
      amount,
      type: 'WITHDRAW',
      status: 'PENDING',
      method,
      accountNumber,
      timestamp: Date.now(),
    };
    const { data } = await supabase.from('transactions').insert(newTx).select().single();
    if (data) setTransactions(prev => [data, ...prev]);
  };

  const updateTransactionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (!tx || tx.status !== 'PENDING') return;

    if (status === 'APPROVED') {
      const { data: user } = await supabase.from('profiles').select('*').eq('id', tx.userId).single();
      if (user) {
        if (tx.type === 'DEPOSIT') {
          const bonus = (tx.amount * adminSettings.depositBonusPercent) / 100;
          await supabase.from('profiles').update({
            balance: user.balance + tx.amount + bonus,
            requiredTurnover: user.requiredTurnover + tx.amount
          }).eq('id', tx.userId);
        } else {
          await supabase.from('profiles').update({ balance: user.balance - tx.amount }).eq('id', tx.userId);
        }
      }
    }
    await supabase.from('transactions').update({ status }).eq('id', id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    refreshBalance();
  };

  const addBetRecord = async (userId: string, gameTitle: string, amount: number, winAmount: number, status: 'WIN' | 'LOSS' | 'PENDING', details: string) => {
    const newBet = { userId, gameTitle, amount, winAmount, status, details, timestamp: Date.now() };
    const { data, error } = await supabase.from('bets').insert(newBet).select().single();
    if (error) return '';
    if (data) setBetHistory(prev => [data, ...prev]);
    
    // Turnover and commission update logic
    const { data: user } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (user) {
      await supabase.from('profiles').update({ currentTurnover: user.currentTurnover + amount }).eq('id', userId);
      if (user.referredBy) {
        const commission = (amount * adminSettings.referralCommission) / 100;
        const { data: referrer } = await supabase.from('profiles').select('commission').eq('id', user.referredBy).single();
        if (referrer) await supabase.from('profiles').update({ commission: referrer.commission + commission }).eq('id', user.referredBy);
      }
    }
    refreshBalance();
    return data?.id || '';
  };

  const updateBetStatus = async (id: string, winAmount: number, status: 'WIN' | 'LOSS') => {
    await supabase.from('bets').update({ winAmount, status }).eq('id', id);
    setBetHistory(prev => prev.map(b => b.id === id ? { ...b, winAmount, status } : b));
  };

  const createMatch = async (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => {
    const newMatch = { title, teamA, teamB, oddsA, oddsB, status: 'OPEN', timestamp: Date.now() };
    const { data } = await supabase.from('matches').insert(newMatch).select().single();
    if (data) setMatches(prev => [data, ...prev]);
  };

  const placeMatchBet = async (matchId: string, team: string, amount: number) => {
    if (!currentUser || currentUser.balance < amount) return false;
    await updateUserBalance(currentUser.id, currentUser.balance - amount);
    await addBetRecord(currentUser.id, 'Create Baji', amount, 0, 'PENDING', `Bet on ${team} for match ID: ${matchId}`);
    return true;
  };

  const resolveMatch = async (matchId: string, winnerTeam: string) => {
    await supabase.from('matches').update({ status: 'RESOLVED', winner: winnerTeam }).eq('id', matchId);
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, status: 'RESOLVED', winner: winnerTeam } : m));
    refreshBalance();
  };

  const deleteMatch = async (matchId: string) => {
    await supabase.from('matches').delete().eq('id', matchId);
    setMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const updateAdminSettings = async (settings: AdminSettings) => {
    await supabase.from('settings').upsert({ id: 1, ...settings });
    setAdminSettings(settings);
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);
    if (currentUser?.id === userId) refreshBalance();
  };

  const giveUserBonus = async (userId: string, amount: number) => {
    const { data: user } = await supabase.from('profiles').select('bonusBalance').eq('id', userId).single();
    if (user) await supabase.from('profiles').update({ bonusBalance: user.bonusBalance + amount }).eq('id', userId);
  };

  const adminUpdateUser = async (userId: string, data: Partial<User>) => {
    await supabase.from('profiles').update(data).eq('id', userId);
    if (currentUser?.id === userId) refreshBalance();
  };

  const claimBonus = async () => {
    if (!currentUser || currentUser.bonusBalance <= 0) return;
    await supabase.from('profiles').update({ balance: currentUser.balance + currentUser.bonusBalance, bonusBalance: 0 }).eq('id', currentUser.id);
    refreshBalance();
  };

  const claimGlobalBonus = async () => {
    if (!currentUser || adminSettings.globalClaimBonus <= 0) return;
    await supabase.from('profiles').update({ bonusBalance: currentUser.bonusBalance + adminSettings.globalClaimBonus }).eq('id', currentUser.id);
    refreshBalance();
  };

  const claimCommission = async () => {
    if (!currentUser || currentUser.commission <= 0) return;
    await supabase.from('profiles').update({ balance: currentUser.balance + currentUser.commission, commission: 0 }).eq('id', currentUser.id);
    refreshBalance();
  };

  const deleteUser = async (userId: string) => {
    await supabase.from('profiles').delete().eq('id', userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

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
