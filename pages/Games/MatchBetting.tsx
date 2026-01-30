
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const MatchBetting: React.FC = () => {
  const { matches, currentUser, placeMatchBet } = useApp();
  const [betAmount, setBetAmount] = useState<number>(100);

  const handleBet = (matchId: string, team: string) => {
    if (!currentUser) return;
    const success = placeMatchBet(matchId, team, betAmount);
    if (success) {
      alert(`Successfully bet ৳${betAmount} on ${team}!`);
    } else {
      alert("Failed to place bet. Check balance or match status.");
    }
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#051a1a] min-h-screen text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-accent italic uppercase tracking-tighter leading-none">Create Baji</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live Match Predictions</p>
      </div>

      <div className="bg-secondary/40 p-4 rounded-2xl mb-6 border border-white/5">
        <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Amount to Bet</p>
        <div className="grid grid-cols-4 gap-2">
          {[100, 500, 1000, 5000].map(v => (
            <button 
              key={v}
              onClick={() => setBetAmount(v)}
              className={`py-2 rounded-xl font-bold text-xs transition ${betAmount === v ? 'bg-accent text-primary' : 'bg-primary/50 text-gray-400 border border-white/5'}`}
            >
              ৳{v}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {matches.filter(m => m.status === 'OPEN').map(match => (
          <div key={match.id} className="bg-secondary p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
            <div className="text-center">
              <p className="text-xs font-black text-accent uppercase tracking-widest mb-1">{match.title}</p>
              <p className="text-[10px] text-gray-500">{new Date(match.timestamp).toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => handleBet(match.id, match.teamA)}
                className="flex-1 bg-primary p-4 rounded-2xl border border-white/10 hover:border-accent group transition"
              >
                <p className="text-sm font-black uppercase text-white group-hover:text-accent">{match.teamA}</p>
                <p className="text-xs font-bold text-gray-500">Odds: <span className="text-accent">{match.oddsA}</span></p>
              </button>
              <div className="text-xl font-black italic text-gray-600">VS</div>
              <button 
                onClick={() => handleBet(match.id, match.teamB)}
                className="flex-1 bg-primary p-4 rounded-2xl border border-white/10 hover:border-accent group transition"
              >
                <p className="text-sm font-black uppercase text-white group-hover:text-accent">{match.teamB}</p>
                <p className="text-xs font-bold text-gray-500">Odds: <span className="text-accent">{match.oddsB}</span></p>
              </button>
            </div>
          </div>
        ))}

        {matches.filter(m => m.status === 'OPEN').length === 0 && (
          <div className="text-center py-20 opacity-30">
            <i className="fa-solid fa-gamepad text-6xl mb-4"></i>
            <p className="font-black italic">No matches available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
