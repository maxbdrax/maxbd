import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header, BottomNav } from './components/Navigation';
import { Home } from './pages/Home';
import { Wallet } from './pages/Wallet';
import { Lottery } from './pages/Games/Lottery';
import { WildBounty } from './pages/Games/WildBounty';
import { SevenUpSevenDown } from './pages/Games/SevenUpSevenDown';
import { CrashGame } from './pages/Games/CrashGame';
import { SuperAce } from './pages/Games/SuperAce';
import { MatchBetting } from './pages/Games/MatchBetting';
import { MoneyComing } from './pages/Games/MoneyComing';
import { Profile } from './pages/Profile';
import { Invite } from './pages/Invite';
import { AdminPanel } from './components/AdminPanel';

const AppContent: React.FC = () => {
  const { currentUser, login, signup, isLoading } = useApp();
  const [activeTab, setActiveTab] = useState('home');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsProcessing(true);
    
    try {
      if (isLogin) {
        const result = await login(username, password);
        if (!result.success) setAuthError(result.message);
      } else {
        const result = await signup(username, password, phone, '', isAdminSignup ? adminSecret : undefined);
        if (!result.success) setAuthError(result.message);
      }
    } catch (err: any) {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#011d1d] text-white">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black italic uppercase tracking-widest text-accent">Loading CV666 Demo...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#011d1d] text-white">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <h1 className="text-6xl font-black text-accent tracking-tighter italic mb-2">CV666</h1>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Demo Experience Hub</p>
          </div>
          <div className="bg-secondary p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-xs font-black rounded-xl transition ${isLogin ? 'bg-accent text-primary' : 'bg-primary/50 text-gray-400'}`}>LOGIN</button>
              <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-xs font-black rounded-xl transition ${!isLogin ? 'bg-accent text-primary' : 'bg-primary/50 text-gray-400'}`}>SIGNUP</button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authError && <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-xl text-red-500 text-[10px] font-bold text-center">{authError}</div>}
              <input type="text" value={username} required onChange={(e) => setUsername(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none" placeholder="Username" />
              {!isLogin && <input type="text" value={phone} required onChange={(e) => setPhone(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none" placeholder="Phone Number" />}
              <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none" placeholder="Password" />
              
              {!isLogin && (
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase text-gray-400">Admin Account?</span>
                  <input type="checkbox" checked={isAdminSignup} onChange={(e) => setIsAdminSignup(e.target.checked)} className="accent-accent" />
                </div>
              )}
              {isAdminSignup && !isLogin && (
                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)} className="w-full bg-red-900/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-500 outline-none" placeholder="Admin Secret Key" />
              )}
              
              <button type="submit" disabled={isProcessing} className="w-full bg-accent text-primary font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest transition-all">
                {isProcessing ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (showAdmin && currentUser.role === 'ADMIN') return <AdminPanel />;
    switch (activeTab) {
      case 'home': return <Home onGameSelect={(id) => setActiveTab(id)} onWalletClick={() => setActiveTab('wallet')} />;
      case 'wallet': return <Wallet />;
      case 'game_lottery': return <Lottery />;
      case 'game_wildbounty': return <WildBounty />;
      case 'game_7updown': return <SevenUpSevenDown />;
      case 'game_crash': return <CrashGame />;
      case 'game_superace': return <SuperAce />;
      case 'game_baji': return <MatchBetting />;
      case 'game_moneycoming': return <MoneyComing />;
      case 'profile': return <Profile />;
      case 'invite': return <Invite />;
      default: return <Home onGameSelect={(id) => setActiveTab(id)} onWalletClick={() => setActiveTab('wallet')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#011d1d]">
      {!showAdmin && <Header onMenuToggle={() => currentUser.role === 'ADMIN' ? setShowAdmin(true) : setActiveTab('profile')} />}
      <main className="pb-20">{renderContent()}</main>
      {!showAdmin && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      {showAdmin && <button onClick={() => setShowAdmin(false)} className="fixed bottom-6 right-6 bg-accent text-primary w-14 h-14 rounded-full shadow-2xl z-[100] border-4 border-[#011d1d]"><i className="fa-solid fa-power-off"></i></button>}
    </div>
  );
};

const App: React.FC = () => (<AppProvider><AppContent /></AppProvider>);
export default App;