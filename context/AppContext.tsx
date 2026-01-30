
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Transaction, AdminSettings, BetRecord, Match, GlobalNotification } from '../types';
import { supabase } from '../services/supabase';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  betHistory: BetRecord[];
  matches: Match[];
  globalNotifications: GlobalNotification[];
  adminSettings: AdminSettings;
  isLoading: boolean;
  notifications: Notification[];
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
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
  adminUpdateUser: (userId: string, data: Partial<User>) => Promise<void>;
  claimGlobalBonus: () => Promise<void>;
  addBetRecord: (userId: string, gameTitle: string, amount: number, winAmount: number, status: 'WIN' | 'LOSS' | 'PENDING', details: string) => Promise<string>;
  createMatch: (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => Promise<void>;
  placeMatchBet: (matchId: string, team: string, amount: number) => Promise<boolean>;
  resolveMatch: (matchId: string, winnerTeam: string) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  sendBroadcast: (message: string, type: 'INFO' | 'ALERT' | 'PROMO') => Promise<void>;
  deleteBroadcast: (id: string) => Promise<void>;
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
  const [globalNotifications, setGlobalNotifications] = useState<GlobalNotification[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const fetchGlobalData = async () => {
    try {
      const { data: noteData } = await supabase.from('global_notifications').select('*').eq('isActive', true).order('timestamp', { ascending: false });
      if (noteData) setGlobalNotifications(noteData);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: settingsData } = await supabase.from('admin_settings').select('*').maybeSingle();
        if (settingsData) setAdminSettings(settingsData);
        
        const { data: matchData } = await supabase.from('matches').select('*').order('timestamp', { ascending: false });
        if (matchData) setMatches(matchData);

        await fetchGlobalData();

        const savedUser = localStorage.getItem('max_user_session');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          const { data: userData, error } = await supabase.from('users').select('*').eq('id', parsed.id).maybeSingle();
          if (userData && !error) {
            setCurrentUser(userData);
            if (userData.role === 'ADMIN') fetchAdminData();
            else fetchUserData(userData.id);
          } else {
            localStorage.removeItem('max_user_session');
          }
        }
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();

    const failsafe = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(failsafe);
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('transactions').select('*').eq('userId', userId).order('timestamp', { ascending: false });
    if (data) setTransactions(data);
  };

  const fetchAdminData = async () => {
    const { data: u } = await supabase.from('users').select('*').order('createdAt', { ascending: false });
    if (u) setUsers(u);
    const { data: t } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
    if (t) setTransactions(t);
  };

  const login = async (username: string, password?: string) => {
    try {
      const { data: user, error } = await supabase.from('users').select('*').eq('username', username).eq('password', password || '123456').maybeSingle();
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('max_user_session', JSON.stringify(user));
        if (user.role === 'ADMIN') fetchAdminData();
        else fetchUserData(user.id);
        addNotification('success', `Welcome back, ${username}!`);
        return { success: true, message: "Login successful" };
      }
      return { success: false, message: "Invalid username or password" };
    } catch (err: any) {
      return { success: false, message: "Connection failed" };
    }
  };

  const signup = async (username: string, password?: string, phone?: string, referralCode?: string, adminSecret?: string) => {
    const role = (adminSecret === 'MAX999_ADMIN_SEC') ? 'ADMIN' : 'USER';
    const newUser = {
      username, password: password || '123456', balance: role === 'ADMIN' ? 999999 : 0,
      commission: 0, bonusBalance: 0, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(), referralCount: 0,
      createdAt: new Date().toISOString(), requiredTurnover: 0, currentTurnover: 0, phone
    };
    const { data, error } = await supabase.from('users').insert([newUser]).select().single();
    if (data) {
      setCurrentUser(data);
      localStorage.setItem('max_user_session', JSON.stringify(data));
      addNotification('success', 'Account created!');
      return { success: true, message: "Success" };
    }
    return { success: false, message: error?.message || "Failed" };
  };

  const sendBroadcast = async (message: string, type: any) => {
    await supabase.from('global_notifications').insert([{
      message, type, timestamp: new Date().toISOString(), isActive: true
    }]);
    fetchGlobalData();
    addNotification('success', 'Broadcast sent to all users!');
  };

  const deleteBroadcast = async (id: string) => {
    await supabase.from('global_notifications').update({ isActive: false }).eq('id', id);
    fetchGlobalData();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('max_user_session');
    addNotification('info', 'Logged out.');
  };

  const refreshBalance = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from('users').select('*').eq('id', currentUser.id).single();
    if (data) setCurrentUser(data);
  };

  const requestDeposit = async (method: any, amount: number, txId: string) => {
    if (!currentUser) return;
    await supabase.from('transactions').insert([{
      userId: currentUser.id, username: currentUser.username, amount, type: 'DEPOSIT',
      status: 'PENDING', method, transactionId: txId, timestamp: new Date().toISOString(),
    }]);
    addNotification('success', 'Deposit submitted!');
  };

  const requestWithdraw = async (method: any, amount: number, accountNumber: string) => {
    if (!currentUser || currentUser.balance < amount) return;
    await supabase.from('transactions').insert([{
      userId: currentUser.id, username: currentUser.username, amount, type: 'WITHDRAW',
      status: 'PENDING', method, accountNumber, timestamp: new Date().toISOString(),
    }]);
    addNotification('success', 'Withdraw submitted!');
  };

  const updateTransactionStatus = async (id: string, status: any) => {
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single();
    if (tx) {
      if (status === 'APPROVED') {
        const { data: u } = await supabase.from('users').select('*').eq('id', tx.userId).single();
        if (u) {
          let nb = Number(u.balance);
          let rt = Number(u.requiredTurnover);
          if (tx.type === 'DEPOSIT') {
            nb += Number(tx.amount) * (1 + adminSettings.depositBonusPercent/100);
            rt += Number(tx.amount);
          } else nb -= Number(tx.amount);
          await supabase.from('users').update({ balance: nb, requiredTurnover: rt }).eq('id', tx.userId);
        }
      }
      await supabase.from('transactions').update({ status }).eq('id', id);
      fetchAdminData();
      refreshBalance();
    }
  };

  const addBetRecord = async (userId: string, gameTitle: string, amount: number, winAmount: number, status: any, details: string) => {
    const { data } = await supabase.from('bet_history').insert([{
      userId, gameTitle, amount, winAmount, status, details, timestamp: new Date().toISOString()
    }]).select().single();
    refreshBalance();
    return data?.id || '';
  };

  const updateUserBalance = async (userId: string, newBalance: number) => {
    await supabase.from('users').update({ balance: newBalance }).eq('id', userId);
    if (currentUser?.id === userId) refreshBalance();
  };

  const updateAdminSettings = async (settings: AdminSettings) => {
    await supabase.from('admin_settings').update(settings).eq('id', (settings as any).id || 1);
    setAdminSettings(settings);
  };

  const createMatch = async (title: string, teamA: string, teamB: string, oddsA: number, oddsB: number) => {
    await supabase.from('matches').insert([{ title, teamA, teamB, oddsA, oddsB, status: 'OPEN', timestamp: new Date().toISOString() }]);
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
    await updateUserBalance(currentUser.id, Number(currentUser.balance) - amount);
    await addBetRecord(currentUser.id, 'Match Betting', amount, 0, 'PENDING', `Bet on ${team}`);
    return true;
  };

  const claimGlobalBonus = async () => {
    if (!currentUser) return;
    await updateUserBalance(currentUser.id, Number(currentUser.balance) + adminSettings.globalClaimBonus);
    addNotification('success', 'Bonus claimed!');
  };

  const adminUpdateUser = async (id: string, updateData: any) => {
    await supabase.from('users').update(updateData).eq('id', id);
    fetchAdminData();
  };

  const deleteUser = async (id: string) => {
    await supabase.from('users').delete().eq('id', id);
    fetchAdminData();
  };

  const fetchBetHistory = async () => {
    const { data } = await supabase.from('bet_history').select('*').eq('userId', currentUser?.id).order('timestamp', { ascending: false });
    if (data) setBetHistory(data);
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, users, transactions, betHistory, matches, globalNotifications, adminSettings, isLoading, notifications,
      addNotification, removeNotification, login, signup, logout, refreshBalance, fetchBetHistory, requestDeposit, requestWithdraw,
      updateTransactionStatus, updateAdminSettings, updateUserBalance, claimGlobalBonus, adminUpdateUser,
      addBetRecord, createMatch, placeMatchBet, resolveMatch, deleteMatch, deleteUser,
      sendBroadcast, deleteBroadcast
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp error");
  return context;
};
