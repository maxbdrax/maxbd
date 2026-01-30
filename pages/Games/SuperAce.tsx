
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const CARD_SYMBOLS = [
  { char: 'A', suit: '♠', color: 'text-gray-800' },
  { char: 'K', suit: '♣', color: 'text-blue-700' },
  { char: 'Q', suit: '♦', color: 'text-red-600' },
  { char: 'J', suit: '♥', color: 'text-red-500' },
  { char: 'A', suit: '♠', color: 'text-yellow-600' }, // Golden card
];

export const SuperAce: React.FC = () => {
  const { currentUser, updateUserBalance } = useApp();
  const [grid, setGrid] = useState<any[][]>(Array(5).fill(null).map(() => Array(4).fill(CARD_SYMBOLS[0])));
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
        Array(4).fill(null).map(() => CARD_SYMBOLS[Math.floor(Math.random() * CARD_SYMBOLS.length)])
      );
      setGrid(newGrid);
      setIsSpinning(false);

      // Random Win Logic
      const winChance = Math.random();
      if (winChance > 0.6) {
        const mults = [1, 2, 3, 5];
        const selectedMult = mults[Math.floor(Math.random() * mults.length)];
        const baseWin = bet * (Math.random() * 5 + 1);
        const finalWin = baseWin * selectedMult;
        
        setMultiplier(selectedMult);
        setWinAmount(finalWin);
        updateUserBalance(currentUser.id, currentUser.balance + finalWin);
      }
    }, 1200);
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#0a1a2f] min-h-screen">
      <div className="relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-4 border-[#2c3e50] bg-slate-900">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
        
        {/* Header Section */}
        <div className="relative z-10 p-4 text-center">
          <div className="bg-gradient-to-b from-red-900 to-black px-6 py-2 rounded-t-2xl border-b-2 border-yellow-600">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase drop-shadow-md">Super Ace</h2>
          </div>
          
          <div className="bg-black/60 py-2 flex justify-center gap-6 border-b border-white/10">
            {[1, 2, 3, 5].map(m => (
              <span key={m} className={`text-xl font-black transition-all duration-300 ${multiplier === m ? 'text-yellow-400 scale-125 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-gray-600'}`}>
                x{m}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-yellow-500 font-bold mt-2 uppercase tracking-widest">Get a Golden Card and have a chance!</p>
        </div>

        {/* Reels Grid */}
        <div className="relative z-10 p-2 grid grid-cols-5 gap-1.5 bg-sky-950/40 border-y border-white/5">
          {grid.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1.5">
              {col.map((card, ri) => (
                <div key={ri} className={`aspect-[2/3] bg-white rounded-md border-2 border-gray-300 flex flex-col items-center justify-between p-1 shadow-md transition-all ${isSpinning ? 'animate-pulse scale-95 blur-[0.5px]' : ''}`}>
                  <span className={`text-xs font-black self-start leading-none ${card.color}`}>{card.char}</span>
                  <span className={`text-2xl ${card.color}`}>{card.suit}</span>
                  <span className={`text-xs font-black self-end rotate-180 leading-none ${card.color}`}>{card.char}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Status Bar */}
        <div className="relative z-10 bg-black/80 px-4 py-2 flex justify-between items-center border-t border-white/10">
           <div className="text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Win</p>
              <p className="text-sm font-black text-yellow-500">{winAmount.toFixed(3)}</p>
           </div>
           <div className="text-center">
              <p className="text-[8px] font-bold text-gray-500 uppercase">Balance</p>
              <p className="text-sm font-black text-white">৳ {currentUser?.balance.toFixed(2)}</p>
           </div>
        </div>

        {/* Controls */}
        <div className="relative z-10 bg-gradient-to-t from-[#1a1a1a] to-[#2c3e50] p-6">
           <div className="flex items-center justify-between">
              <div className="flex flex-col items-center gap-1">
                <button className="w-10 h-10 bg-gray-800 rounded-full border border-white/20 text-white shadow-inner">
                  <i className="fa-solid fa-gear"></i>
                </button>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center">
                    <button onClick={() => setBet(Math.max(2, bet - 1))} className="w-8 h-8 rounded-full bg-white/10 text-white"><i className="fa-solid fa-minus text-xs"></i></button>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">Bet {bet}</span>
                 </div>
                 
                 <button 
                  onClick={spin}
                  disabled={isSpinning}
                  className="w-20 h-20 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full border-4 border-white shadow-[0_0_20px_rgba(250,204,21,0.5)] flex items-center justify-center active:scale-90 transition group"
                 >
                    <div className="w-14 h-14 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white/30 group-hover:rotate-180 transition-transform duration-500">
                       <i className={`fa-solid fa-rotate-right text-3xl text-white ${isSpinning ? 'animate-spin' : ''}`}></i>
                    </div>
                 </button>

                 <div className="flex flex-col items-center">
                    <button onClick={() => setBet(bet + 1)} className="w-8 h-8 rounded-full bg-white/10 text-white"><i className="fa-solid fa-plus text-xs"></i></button>
                    <button className="w-10 h-10 bg-yellow-700/50 rounded-full border border-yellow-500/30 text-yellow-400 shadow-inner mt-2">
                       <i className="fa-solid fa-bolt"></i>
                    </button>
                 </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button className="w-10 h-10 bg-gray-800 rounded-full border border-white/20 text-white shadow-inner">
                  <i className="fa-solid fa-circle-play"></i>
                </button>
                <span className="text-[7px] font-black text-gray-500">AUTOPLAY</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
