
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

const SYMBOLS = ['💎', '💍', '🏆', '💰', '🌟', '7', 'BAR'];
const MULTIPLIERS = [1, 2, 3, 5, 10, 15];

export const FortuneGems: React.FC = () => {
  const { currentUser, updateUserBalance, addBetRecord } = useApp();
  const [grid, setGrid] = useState<string[][]>(Array(3).fill(null).map(() => Array(3).fill('?')));
  const [multReel, setMultReel] = useState(1);
  const [isSpinning, setIsSpinning] = useState(false);
  const [bet, setBet] = useState(2);
  const [win, setWin] = useState(0);

  const spin = () => {
    if (!currentUser || currentUser.balance < bet || isSpinning) return;
    
    updateUserBalance(currentUser.id, currentUser.balance - bet);
    setIsSpinning(true);
    setWin(0);

    setTimeout(() => {
      const newGrid = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      );
      const newMult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
      
      setGrid(newGrid);
      setMultReel(newMult);
      setIsSpinning(false);

      // Simple win logic: check middle row matches
      const middleRow = newGrid.map(col => col[1]);
      const isMatch = middleRow.every(s => s === middleRow[0]);
      
      if (isMatch || Math.random() > 0.8) {
        const baseWin = bet * (Math.random() * 10 + 2);
        const finalWin = baseWin * newMult;
        setWin(finalWin);
        updateUserBalance(currentUser.id, currentUser.balance + finalWin);
        addBetRecord(currentUser.id, 'Fortune Gems 3', bet, finalWin, 'WIN', `Match with x${newMult}`);
      } else {
        addBetRecord(currentUser.id, 'Fortune Gems 3', bet, 0, 'LOSS', 'No match');
      }
    }, 1200);
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#0a0a0a] min-h-screen text-white">
      <div className="bg-[#1a1300] border-4 border-yellow-600 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-4 bg-gradient-to-b from-yellow-700 to-[#1a1300] text-center border-b-2 border-yellow-500">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">Fortune Gems 3</h2>
           <p className="text-[8px] font-bold text-yellow-200 uppercase">JILI SPIN ELITE</p>
        </div>

        {/* Reels Area */}
        <div className="flex p-4 gap-2 bg-black/40">
           {/* 3x3 Main Reels */}
           <div className="flex-1 grid grid-cols-3 gap-1.5">
              {grid.map((col, ci) => (
                <div key={ci} className="flex flex-col gap-1.5">
                  {col.map((s, ri) => (
                    <div key={ri} className="aspect-square bg-gradient-to-br from-yellow-900/40 to-black rounded-lg border border-yellow-600/30 flex items-center justify-center text-3xl shadow-inner">
                      <span className={isSpinning ? 'animate-pulse' : ''}>{s}</span>
                    </div>
                  ))}
                </div>
              ))}
           </div>
           {/* Multiplier Reel */}
           <div className="w-16 flex flex-col gap-1.5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`flex-1 rounded-lg border-2 flex items-center justify-center text-xl font-black ${i === 1 ? 'border-accent bg-accent/20 text-accent shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'border-white/5 opacity-30 text-gray-500'}`}>
                   {i === 1 ? `x${multReel}` : `x${MULTIPLIERS[Math.floor(Math.random() * 6)]}`}
                </div>
              ))}
           </div>
        </div>

        {/* Win Bar */}
        <div className="bg-black/80 py-3 px-6 flex justify-between items-center border-y border-yellow-600/20">
           <div>
              <p className="text-[8px] font-black text-gray-500 uppercase">Total Win</p>
              <p className="text-xl font-black text-accent italic">৳{win.toFixed(2)}</p>
           </div>
           <div className="text-right">
              <p className="text-[8px] font-black text-gray-500 uppercase">Balance</p>
              <p className="text-sm font-black text-white tracking-tighter">৳ {currentUser?.balance.toFixed(2)}</p>
           </div>
        </div>

        {/* Control Footer */}
        <div className="p-6 bg-[#1a1300] flex items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <button onClick={() => setBet(Math.max(2, bet - 1))} className="w-8 h-8 rounded-full border border-yellow-500/30 text-white"><i className="fa-solid fa-minus text-xs"></i></button>
              <div className="bg-black/60 px-3 py-1 rounded-lg border border-yellow-500/20"><span className="text-xs font-black text-accent">৳{bet}</span></div>
              <button onClick={() => setBet(bet + 1)} className="w-8 h-8 rounded-full border border-yellow-500/30 text-white"><i className="fa-solid fa-plus text-xs"></i></button>
           </div>
           
           <button 
            onClick={spin}
            disabled={isSpinning}
            className="w-20 h-20 bg-gradient-to-b from-yellow-400 to-yellow-800 rounded-full border-4 border-white shadow-xl flex items-center justify-center active:scale-90 transition group"
           >
              <div className="w-14 h-14 bg-yellow-600 rounded-full flex items-center justify-center border-2 border-white/50 group-hover:rotate-180 transition-transform duration-500">
                <i className={`fa-solid fa-rotate text-3xl text-white ${isSpinning ? 'animate-spin' : ''}`}></i>
              </div>
           </button>
        </div>
      </div>
    </div>
  );
};
