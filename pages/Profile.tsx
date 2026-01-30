
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const Profile: React.FC = () => {
  const { currentUser, claimCommission, claimBonus, logout, betHistory, fetchBetHistory } = useApp();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (showHistory) fetchBetHistory();
  }, [showHistory]);

  if (!currentUser) return null;

  const turnoverProgress = currentUser.requiredTurnover > 0 
    ? Math.min(100, (currentUser.currentTurnover / currentUser.requiredTurnover) * 100) 
    : 100;

  if (showHistory) {
    return (
      <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setShowHistory(false)} className="bg-secondary p-3 rounded-full text-white hover:bg-white/10 transition">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-xl font-black text-accent italic uppercase tracking-tighter">My Bet Records</h2>
          <button onClick={fetchBetHistory} className="bg-secondary p-3 rounded-full text-accent">
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>

        <div className="space-y-4">
          {betHistory.length === 0 ? (
            <div className="text-center py-20 opacity-30">
               <i className="fa-solid fa-folder-open text-6xl mb-4"></i>
               <p className="font-bold">No history found</p>
            </div>
          ) : (
            betHistory.map(bet => (
              <div key={bet.id} className="bg-secondary p-5 rounded-3xl border border-white/10 shadow-lg flex justify-between items-center hover:border-white/20 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-primary px-2 py-0.5 rounded text-accent uppercase">{bet.gameTitle}</span>
                    <span className="text-[8px] text-gray-500 font-bold">{new Date(bet.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 italic line-clamp-1">{bet.details}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs font-black text-white">Bet: ৳{bet.amount}</p>
                  <p className={`text-sm font-black italic ${bet.status === 'WIN' ? 'text-green-500' : bet.status === 'LOSS' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {bet.status === 'WIN' ? `+৳${bet.winAmount}` : bet.status === 'LOSS' ? `-৳${bet.amount}` : 'PENDING'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-secondary rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <i className="fa-solid fa-shield-halved text-9xl"></i>
        </div>
        <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-accent shadow-xl mb-4 relative z-10" alt="user" />
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase relative z-10">{currentUser.username}</h2>
        <div className="bg-primary/80 px-4 py-1 rounded-full text-[10px] font-black text-accent mt-2 border border-accent/20 relative z-10">
          LEVEL: ELITE MEMBER
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full mt-8 relative z-10">
          <div className="bg-primary/50 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Balance</p>
            <p className="text-xl font-black text-accent italic">৳{currentUser.balance.toFixed(2)}</p>
          </div>
          <div className="bg-primary/50 p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Bets Count</p>
            <p className="text-xl font-black text-blue-500 italic">{betHistory.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-secondary/60 p-5 rounded-2xl border border-white/5 space-y-3">
         <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turnover Progress</span>
            <span className="text-[10px] font-black text-blue-400 uppercase italic">৳{currentUser.currentTurnover.toFixed(0)} / ৳{currentUser.requiredTurnover.toFixed(0)}</span>
         </div>
         <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${turnoverProgress >= 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
              style={{ width: `${turnoverProgress}%` }}
            ></div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-[#015252] to-[#013d3d] rounded-2xl p-6 border border-[#019d9d]/20 shadow-xl flex items-center justify-between group hover:border-[#019d9d]/40 transition">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary text-xl shadow-lg"><i className="fa-solid fa-hand-holding-dollar"></i></div>
              <div>
                 <p className="text-xs font-bold text-gray-400">Commission</p>
                 <p className="text-xl font-black text-white italic">৳{currentUser.commission.toFixed(2)}</p>
              </div>
           </div>
           <button onClick={claimCommission} disabled={currentUser.commission <= 0} className="bg-accent text-primary font-black px-4 py-2 rounded-xl text-xs disabled:opacity-50 active:scale-95 transition">CLAIM</button>
        </div>

        {currentUser.bonusBalance > 0 && (
          <div className="bg-gradient-to-br from-[#6b1e1e] to-[#421111] rounded-2xl p-6 border border-red-500/20 shadow-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"><i className="fa-solid fa-gift"></i></div>
               <div>
                  <p className="text-xs font-bold text-red-300">Bonus Available!</p>
                  <p className="text-xl font-black text-white italic">৳{currentUser.bonusBalance.toFixed(2)}</p>
               </div>
            </div>
            <button onClick={claimBonus} className="bg-white text-red-600 font-black px-4 py-2 rounded-xl text-xs active:scale-95 transition">CLAIM</button>
          </div>
        )}
      </div>

      <div className="bg-secondary rounded-3xl overflow-hidden border border-white/10">
        {[
          { icon: 'fa-clock-rotate-left', label: 'Betting History', onClick: () => setShowHistory(true) },
          { icon: 'fa-shield-halved', label: 'Security Center', onClick: () => {} },
          { icon: 'fa-headset', label: 'Support 24/7', onClick: () => {} }
        ].map((item, idx) => (
          <button key={idx} onClick={item.onClick} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition border-b border-white/5 last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/40 flex items-center justify-center">
                <i className={`fa-solid ${item.icon} text-accent text-sm`}></i>
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</span>
            </div>
            <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
          </button>
        ))}
      </div>

      <button onClick={logout} className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 font-black py-5 rounded-3xl border border-red-500/20 transition uppercase tracking-widest text-xs shadow-lg">
        Logout Account
      </button>
    </div>
  );
};
