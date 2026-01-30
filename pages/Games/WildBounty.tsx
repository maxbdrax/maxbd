
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const SYMBOLS = ['🤠', '🔫', '🥃', '💰', '🐎', 'A', 'K', 'Q', 'J'];

export const WildBounty: React.FC = () => {
  const { currentUser, updateUserBalance } = useApp();
  const [grid, setGrid] = useState<string[][]>(Array(5).fill(null).map(() => Array(3).fill('?')));
  const [multiplier, setMultiplier] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [bet, setBet] = useState(2);

  const spin = () => {
    if (!currentUser || currentUser.balance < bet || isSpinning) return;

    updateUserBalance(currentUser.id, currentUser.balance - bet);
    setIsSpinning(true);
    setWinAmount(0);
    setMultiplier(1);

    setTimeout(() => {
      const newGrid = Array(5).fill(null).map(() => 
        Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      );
      setGrid(newGrid);
      setIsSpinning(false);

      // Simple win check
      const hasWin = Math.random() > 0.7;
      if (hasWin) {
        const win = bet * (Math.floor(Math.random() * 5) + 2);
        setWinAmount(win);
        setMultiplier(2);
        updateUserBalance(currentUser.id, currentUser.balance + win);
      }
    }, 1000);
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#1a0f0a] min-h-screen font-serif">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#8b4513] bg-[url('https://images.unsplash.com/photo-1533157577004-bb57bbcd11a0?q=80&w=1000&auto=format&fit=crop')] bg-cover">
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Top Board */}
        <div className="relative z-10 pt-4 px-4 flex flex-col items-center">
           <div className="bg-[#5c2d11] border-2 border-[#d2691e] px-8 py-2 rounded-t-xl shadow-lg transform -skew-x-6">
              <span className="text-2xl font-black text-[#ffd700] italic uppercase tracking-tighter">Wild Bounty</span>
           </div>
           <div className="w-full bg-[#3e2723] p-2 flex justify-center gap-4 border-y border-[#d2691e]">
              <span className={`text-xl font-black ${multiplier > 1 ? 'text-orange-500 scale-125' : 'text-gray-500'} transition`}>X1</span>
              <span className={`text-xl font-black ${multiplier > 1 ? 'text-orange-500' : 'text-gray-500'}`}>X2</span>
              <span className={`text-xl font-black ${multiplier > 2 ? 'text-orange-500' : 'text-gray-500'}`}>X4</span>
              <span className={`text-xl font-black ${multiplier > 4 ? 'text-orange-500' : 'text-gray-500'}`}>X8</span>
           </div>
        </div>

        {/* Reels Grid */}
        <div className="relative z-10 p-4">
           <div className="grid grid-cols-5 gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-sm border border-white/5">
              {grid.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-2">
                   {col.map((symbol, ri) => (
                     <div key={ri} className="aspect-square bg-[#4e342e] rounded-lg border border-[#6d4c41] flex items-center justify-center text-2xl shadow-inner transition-all">
                       <span className={isSpinning ? 'animate-pulse blur-[1px]' : ''}>{symbol}</span>
                     </div>
                   ))}
                </div>
              ))}
           </div>
        </div>

        {/* Info Bars */}
        <div className="relative z-10 grid grid-cols-3 gap-2 px-4 mb-4">
           <div className="bg-black/60 p-2 rounded border border-[#d2691e]/30 text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Balance</p>
              <p className="text-xs font-black text-white">৳{currentUser?.balance.toFixed(2)}</p>
           </div>
           <div className="bg-black/60 p-2 rounded border border-[#d2691e]/30 text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Total Bet</p>
              <p className="text-xs font-black text-white">৳{bet.toFixed(2)}</p>
           </div>
           <div className="bg-black/60 p-2 rounded border border-[#d2691e]/30 text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Win</p>
              <p className="text-xs font-black text-yellow-400 font-black">৳{winAmount.toFixed(2)}</p>
           </div>
        </div>

        {/* Control Section */}
        <div className="relative z-10 bg-[#3e2723] p-6 border-t-4 border-[#8b4513]">
           <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col items-center">
                 <button className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg text-white">
                    <i className="fa-solid fa-bolt text-xs"></i>
                 </button>
                 <span className="text-[8px] font-black text-white mt-1">TURBO</span>
              </div>

              <div className="flex items-center gap-2">
                 <button onClick={() => setBet(Math.max(2, bet - 1))} className="w-8 h-8 rounded-full border border-white/20 text-white"><i className="fa-solid fa-minus text-xs"></i></button>
                 <button 
                  onClick={spin}
                  disabled={isSpinning}
                  className="w-16 h-16 bg-gradient-to-b from-[#d2691e] to-[#8b4513] rounded-full border-4 border-[#ffd700] shadow-[0_0_20px_rgba(210,105,30,0.5)] flex items-center justify-center text-2xl text-white active:scale-90 transition"
                 >
                    <i className={`fa-solid fa-rotate ${isSpinning ? 'animate-spin' : ''}`}></i>
                 </button>
                 <button onClick={() => setBet(bet + 1)} className="w-8 h-8 rounded-full border border-white/20 text-white"><i className="fa-solid fa-plus text-xs"></i></button>
              </div>

              <div className="flex flex-col items-center">
                 <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg text-white">
                    <i className="fa-solid fa-play text-xs"></i>
                 </button>
                 <span className="text-[8px] font-black text-white mt-1">AUTO</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
