
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
  const [referralCode, setReferralCode] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [isAdminSignup, setIsAdminSignup] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      setIsLogin(false);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsProcessing(true);
    
    try {
      if (isLogin) {
        const result = await login(username, password);
        if (!result.success) setAuthError(result.message);
      } else {
        const result = await signup(
          username, 
          password, 
          phone, 
          referralCode, 
          isAdminSignup ? adminSecret : undefined
        );
        if (!result.success) setAuthError(result.message);
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#011d1d] text-white">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black italic uppercase tracking-widest text-accent">Connecting CV666 Cloud...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#011d1d] text-white">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <h1 className="text-6xl font-black text-accent tracking-tighter italic mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.3)]">CV666</h1>
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Premium Entertainment Hub</p>
          </div>
          <div className="bg-secondary p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6">
            <div className="flex gap-4 mb-4">
              <button onClick={() => { setIsLogin(true); setIsAdminSignup(false); setAuthError(''); }} className={`flex-1 py-2 text-xs font-black rounded-xl transition ${isLogin ? 'bg-accent text-primary' : 'bg-primary/50 text-gray-400'}`}>SIGN IN</button>
              <button onClick={() => { setIsLogin(false); setAuthError(''); }} className={`flex-1 py-2 text-xs font-black rounded-xl transition ${!isLogin ? 'bg-accent text-primary' : 'bg-primary/50 text-gray-400'}`}>SIGN UP</button>
            </div>
            
            <form onSubmit={handleAuth} className="space-y-4">
              {authError && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-xl text-red-500 text-[10px] font-bold text-center animate-shake">
                  {authError}
                </div>
              )}

              <input type="text" value={username} required onChange={(e) => setUsername(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent/30 transition" placeholder="Username" />
              {!isLogin && <input type="text" value={phone} required onChange={(e) => setPhone(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent/30 transition" placeholder="017xxxxxxxx" />}
              <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-white outline-none focus:border-accent/30 transition" placeholder="Password (Min 6 chars)" />
              
              {!isLogin && (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={referralCode} 
                    onChange={(e) => setReferralCode(e.target.value)} 
                    className="w-full bg-primary border border-white/5 rounded-2xl px-5 py-4 text-accent outline-none font-bold placeholder:font-normal" 
                    placeholder="Referral Code (Optional)" 
                  />
                  
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] font-black uppercase text-gray-400">Register as Admin?</span>
                    <button 
                      type="button"
                      onClick={() => setIsAdminSignup(!isAdminSignup)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isAdminSignup ? 'bg-accent' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAdminSignup ? 'right-1' : 'left-1'}`}></div>
                    </button>
                  </div>

                  {isAdminSignup && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <input 
                        type="password" 
                        value={adminSecret} 
                        required={isAdminSignup}
                        onChange={(e) => setAdminSecret(e.target.value)} 
                        className="w-full bg-red-900/10 border border-red-500/30 rounded-2xl px-5 py-4 text-red-500 outline-none font-black placeholder:font-normal" 
                        placeholder="Admin Secret Key" 
                      />
                      <p className="text-[8px] text-red-500/60 mt-1 ml-2 uppercase font-bold italic">Verification required for Admin access</p>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={isProcessing}
                className={`w-full ${isAdminSignup ? 'bg-red-600 text-white' : 'bg-accent text-primary'} font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest transition-all hover:scale-[1.02] disabled:opacity-50`}
              >
                {isProcessing ? 'Processing...' : (isLogin ? 'Login Now' : (isAdminSignup ? 'Create Admin Account' : 'Create Account'))}
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
      default: return <div className="p-12 text-center opacity-30">Coming Soon</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#011d1d]">
      {!showAdmin && <Header onMenuToggle={() => { if (currentUser.role === 'ADMIN') setShowAdmin(true); else setActiveTab('profile'); }} />}
      <main className={`${showAdmin ? '' : 'max-w-4xl mx-auto'}`}>{renderContent()}</main>
      {!showAdmin && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}
      {showAdmin && <button onClick={() => setShowAdmin(false)} className="fixed bottom-6 right-6 bg-accent text-primary w-14 h-14 rounded-full shadow-2xl z-[100] border-4 border-[#011d1d] hover:scale-110 transition"><i className="fa-solid fa-power-off"></i></button>}
    </div>
  );
};

const App: React.FC = () => (<AppProvider><AppContent /></AppProvider>);
export default App;
