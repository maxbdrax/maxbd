
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

interface BetSlot {
  label: string;
  odds: string;
  range: [number, number];
  multiplier: number;
}

const SLOTS: Record<string, BetSlot> = {
  'low': { label: '2 ~ 6', odds: '1:1', range: [2, 6], multiplier: 2 },
  'seven': { label: '7', odds: '1:5', range: [7, 7], multiplier: 6 },
  'high': { label: '8 ~ 12', odds: '8 ~ 12', range: [8, 12], multiplier: 2 }
};

const CHIPS = [5, 10, 20, 50, 100, 500];

export const SevenUpSevenDown: React.FC = () => {
  const { currentUser, updateUserBalance, addBetRecord } = useApp();
  const [selectedChip, setSelectedChip] = useState(5);
  const [bets, setBets] = useState<Record<string, number>>({ low: 0, seven: 0, high: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRolling, setIsRolling] = useState(false);
  const [lastRoll, setLastRoll] = useState<{ d1: number, d2: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          rollDice();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [bets]);

  const rollDice = () => {
    setIsRolling(true);
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;

    setTimeout(() => {
      setLastRoll({ d1, d2 });
      setIsRolling(false);
      
      let totalWin = 0;
      let details = "";

      // Explicitly casting Object.entries to handle unknown types in arithmetic operations
      (Object.entries(bets) as [string, number][]).forEach(([slotKey, amount]) => {
        // Fix: Ensure amount is treated as number for comparison
        if (amount <= 0) return;
        const slot = SLOTS[slotKey];
        if (sum >= slot.range[0] && sum <= slot.range[1]) {
          // Fix: Ensure amount is treated as number for multiplication
          const win = amount * slot.multiplier;
          totalWin += win;
          details += ` Won ${slot.label} (${amount}x${slot.multiplier})`;
        } else {
          details += ` Lost ${slot.label} (${amount})`;
        }
      });

      if (totalWin > 0 && currentUser) {
        // Fix: Explicitly casting Object.values to number[] to ensure reduce returns a number
        const totalBetAmount = (Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0);
        updateUserBalance(currentUser.id, currentUser.balance + totalWin);
        addBetRecord(currentUser.id, '7 Up 7 Down', totalBetAmount, totalWin, 'WIN', details);
      } else if (((Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0)) > 0 && currentUser) {
        // Fix: Explicitly casting Object.values to number[] to ensure reduce returns a number and avoids comparison errors
        const totalBetAmount = (Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0);
        addBetRecord(currentUser.id, '7 Up 7 Down', totalBetAmount, 0, 'LOSS', details);
      }

      setHistory(prev => [{ sum, d1, d2 }, ...prev.slice(0, 9)]);
      setBets({ low: 0, seven: 0, high: 0 });
    }, 2000);
  };

  const placeBet = (slot: string) => {
    if (!currentUser || timeLeft < 2 || isRolling) return;
    if (currentUser.balance < selectedChip) {
      alert("Insufficient Balance!");
      return;
    }
    updateUserBalance(currentUser.id, currentUser.balance - selectedChip);
    setBets(prev => ({ ...prev, [slot]: prev[slot] + selectedChip }));
  };

  return (
    <div className="pt-16 pb-24 px-4 max-w-lg mx-auto bg-[#310606] min-h-screen text-white font-sans overflow-x-hidden">
      {/* Game Header */}
      <div className="flex justify-between items-center bg-black/40 p-2 rounded-t-xl text-[10px] font-bold border-b border-white/10">
        <div className="flex gap-4">
          <span>Min. Bet: <span className="text-yellow-500">৳5</span></span>
          <span className="text-gray-400">ID: 01987624041</span>
        </div>
        <div className="text-gray-400">Round ID: SUD-Sc1AjtW</div>
      </div>

      {/* Top Banner with Dealer */}
      <div className="relative aspect-video bg-gradient-to-b from-[#4d1010] to-[#2a0505] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1596838132731-dd96a3375935?q=80&w=400&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          alt="background"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Simulated Dealer */}
          <div className="relative w-48 h-48 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=LuckyDealer')" }}></div>
        </div>
        {/* Top Winners Sidebars */}
        <div className="absolute left-2 top-4 bottom-4 w-12 bg-black/20 rounded flex flex-col items-center py-2 gap-2 text-[8px] font-bold uppercase">
          <span className="text-yellow-500">Richest</span>
          <div className="flex flex-col gap-1">
            {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border border-yellow-500/30 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} /></div>)}
          </div>
        </div>
        <div className="absolute right-2 top-4 bottom-4 w-12 bg-black/20 rounded flex flex-col items-center py-2 gap-2 text-[8px] font-bold uppercase">
          <span className="text-cyan-400">Big Winners</span>
          <div className="flex flex-col gap-1">
            {[4,5,6].map(i => <div key={i} className="w-8 h-8 rounded-full border border-cyan-500/30 overflow-hidden"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} /></div>)}
          </div>
        </div>

        {/* Timer UI */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#019d9d] to-transparent px-8 py-1">
          <p className="text-[10px] font-bold uppercase text-center text-white/80">Place bet now</p>
          <p className="text-2xl font-black text-center leading-none text-white">{timeLeft}</p>
        </div>
      </div>

      {/* Main Betting Table */}
      <div className="relative p-2 bg-[#4a0a0a] border-t-2 border-yellow-700 shadow-inner">
        <div className="grid grid-rows-2 gap-2 aspect-[4/3] relative p-4 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]">
          
          {/* 8-12 Betting Area */}
          <div 
            onClick={() => placeBet('high')}
            className={`border-2 border-yellow-700/50 rounded-tl-[3rem] rounded-tr-[3rem] relative flex flex-col items-center justify-center group active:scale-95 transition ${timeLeft < 2 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="absolute inset-0 bg-yellow-900/10 rounded-tl-[3rem] rounded-tr-[3rem]"></div>
            <span className="text-3xl font-black text-yellow-500 italic drop-shadow-lg relative z-10">8 ~ 12</span>
            <span className="text-xs font-bold text-white relative z-10">1 : 1</span>
            {bets.high > 0 && (
              <div className="absolute bottom-2 right-4 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black z-20">৳{bets.high}</div>
            )}
          </div>

          {/* 2-6 Betting Area */}
          <div 
            onClick={() => placeBet('low')}
            className={`border-2 border-yellow-700/50 rounded-bl-[3rem] rounded-br-[3rem] relative flex flex-col items-center justify-center group active:scale-95 transition ${timeLeft < 2 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className="absolute inset-0 bg-yellow-900/10 rounded-bl-[3rem] rounded-br-[3rem]"></div>
            <span className="text-3xl font-black text-yellow-500 italic drop-shadow-lg relative z-10">2 ~ 6</span>
            <span className="text-xs font-bold text-white relative z-10">1 : 1</span>
            {bets.low > 0 && (
              <div className="absolute top-2 right-4 bg-yellow-500 text-black px-2 py-0.5 rounded-full text-[10px] font-black z-20">৳{bets.low}</div>
            )}
          </div>

          {/* Circle 7 Area */}
          <div 
            onClick={() => placeBet('seven')}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full border-4 border-yellow-500 bg-[#5c0e0e] shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center z-20 cursor-pointer active:scale-90 transition ${timeLeft < 2 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <span className="text-6xl font-black text-yellow-500 drop-shadow-md">7</span>
            <span className="text-sm font-bold text-white">1 : 5</span>
            {bets.seven > 0 && (
              <div className="absolute -bottom-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black">৳{bets.seven}</div>
            )}
          </div>
        </div>

        {/* Rolling/Result Overlay */}
        {isRolling && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-white rounded-xl shadow-2xl flex items-center justify-center animate-bounce">
                <i className={`fa-solid fa-dice-${['one','two','three','four','five','six'][Math.floor(Math.random()*6)]} text-4xl text-black`}></i>
              </div>
              <div className="w-16 h-16 bg-white rounded-xl shadow-2xl flex items-center justify-center animate-bounce delay-100">
                <i className={`fa-solid fa-dice-${['one','two','three','four','five','six'][Math.floor(Math.random()*6)]} text-4xl text-black`}></i>
              </div>
            </div>
          </div>
        )}

        {lastRoll && !isRolling && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-black/80 p-4 rounded-3xl border-2 border-yellow-500 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex gap-4 items-center">
              <i className={`fa-solid fa-dice-${['zero','one','two','three','four','five','six'][lastRoll.d1]} text-5xl text-white`}></i>
              <span className="text-3xl font-black text-yellow-500">+</span>
              <i className={`fa-solid fa-dice-${['zero','one','two','three','four','five','six'][lastRoll.d2]} text-5xl text-white`}></i>
              <span className="text-4xl font-black text-white ml-2">= {lastRoll.d1 + lastRoll.d2}</span>
            </div>
          </div>
        )}
      </div>

      {/* User Stats Bar */}
      <div className="bg-[#1a1a1a] p-2 flex items-center justify-between border-y border-white/5">
        <div className="flex items-center gap-2">
          <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-yellow-500" />
          <div>
            <p className="text-[10px] font-black uppercase text-gray-500 leading-none">Balance</p>
            <p className="text-xs font-black text-yellow-500">৳{currentUser?.balance.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-black text-black">C</div>
          <span className="text-xs font-black">{selectedChip}</span>
        </div>
      </div>

      {/* History Grid */}
      <div className="grid grid-cols-10 gap-0.5 bg-black/20 mt-1 h-14 overflow-hidden border-b border-white/10">
        {history.map((h, i) => (
          <div key={i} className="flex flex-col items-center justify-center bg-white/5 border-r border-white/5 p-1">
            <p className="text-xs font-black text-yellow-500">{h.sum}</p>
            <div className="flex gap-0.5 text-[8px] text-gray-500">
              <span>{h.d1}</span>
              <span>+</span>
              <span>{h.d2}</span>
            </div>
          </div>
        ))}
        {Array.from({ length: 10 - history.length }).map((_, i) => (
          <div key={i} className="bg-white/5 border-r border-white/5"></div>
        ))}
      </div>

      {/* Chip Selector Footer */}
      <div className="mt-4 flex justify-around px-2 pb-4">
        {CHIPS.map(val => (
          <button 
            key={val}
            onClick={() => setSelectedChip(val)}
            className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition shadow-lg ${
              selectedChip === val 
                ? 'border-yellow-400 bg-yellow-500 scale-110 -translate-y-1' 
                : 'border-white/20 bg-primary grayscale opacity-70'
            }`}
          >
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">
              {val}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
