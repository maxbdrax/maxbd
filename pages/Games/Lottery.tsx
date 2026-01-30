
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getLuckyPrediction } from '../../services/geminiService';
import { GameAction } from '../../types';

export const Lottery: React.FC = () => {
  const { currentUser, updateUserBalance, addBetRecord } = useApp();
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState(30);
  const [history, setHistory] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<string>('Ready for the next round?');
  const [isPredicting, setIsPredicting] = useState(false);
  
  // Multiple active bets tracking
  const [activeBets, setActiveBets] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 30) {
      resolveRound();
    }
  }, [timeLeft === 30]);

  const fetchPrediction = async () => {
    setIsPredicting(true);
    const p = await getLuckyPrediction('Red vs Green / Big Small / Number');
    setPrediction(p);
    setIsPredicting(false);
  };

  const resolveRound = () => {
    const number = Math.floor(Math.random() * 10);
    const isRed = [0, 2, 4, 6, 8].includes(number);
    const color = isRed ? 'RED' : 'GREEN';
    const size = number >= 5 ? 'BIG' : 'SMALL';

    setHistory(prev => [{ number, color, size }, ...prev.slice(0, 19)]);

    if (Object.keys(activeBets).length > 0 && currentUser) {
      let totalWin = 0;
      let details = `Result: ${number} (${color}, ${size}).`;

      // Explicitly casting Object.entries to handle unknown types in arithmetic operations
      (Object.entries(activeBets) as [string, number][]).forEach(([betKey, amount]) => {
        let isWin = false;
        let payout = 2; // Default 1:1 odds (2x return)

        if (betKey === 'RED' && color === 'RED') isWin = true;
        if (betKey === 'GREEN' && color === 'GREEN') isWin = true;
        if (betKey === 'BIG' && size === 'BIG') isWin = true;
        if (betKey === 'SMALL' && size === 'SMALL') isWin = true;
        
        // Handle number betting
        if (betKey.startsWith('NUM_')) {
          const num = parseInt(betKey.split('_')[1]);
          if (num === number) {
            isWin = true;
            payout = 9; // Number bet pays 1:8 (9x return)
          }
        }

        if (isWin) {
          // Fix: Ensure amount is treated as number for multiplication
          totalWin += amount * payout;
          details += ` Win on ${betKey}(৳${amount}x${payout}).`;
        } else {
          details += ` Loss on ${betKey}(৳${amount}).`;
        }
      });

      if (totalWin > 0) {
        updateUserBalance(currentUser.id, currentUser.balance + totalWin);
        // Fix: Explicitly casting Object.values to number[] to ensure reduce returns a number
        const totalAmount = (Object.values(activeBets) as number[]).reduce((a: number, b: number) => a + b, 0);
        addBetRecord(currentUser.id, 'Color Prediction', totalAmount, totalWin, 'WIN', details);
        alert(`🎉 WIN! You received ৳${totalWin.toFixed(2)} total win!`);
      } else {
        // Fix: Explicitly casting Object.values to number[] to ensure reduce returns a number
        const totalAmount = (Object.values(activeBets) as number[]).reduce((a: number, b: number) => a + b, 0);
        addBetRecord(currentUser.id, 'Color Prediction', totalAmount, 0, 'LOSS', details);
        alert(`❌ LOST! Result was ${number} (${color} ${size})`);
      }
      setActiveBets({});
    }
  };

  const handleBet = (actionKey: string) => {
    if (!currentUser) return;
    if (currentUser.balance < selectedAmount) {
      alert("Insufficient funds!");
      return;
    }
    if (timeLeft < 3) {
      alert("Betting closed for this round!");
      return;
    }

    // Deduct money
    updateUserBalance(currentUser.id, currentUser.balance - selectedAmount);
    setActiveBets(prev => ({
      ...prev,
      [actionKey]: (prev[actionKey] || 0) + selectedAmount
    }));
  };

  // Fix: Explicitly casting Object.values to number[] to ensure reduce returns a number and totalCurrentBet is not 'unknown'
  const totalCurrentBet = (Object.values(activeBets) as number[]).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-4 bg-[#051a1a] min-h-screen">
      <div className="bg-secondary/90 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-accent italic uppercase tracking-tighter leading-none">CV Lottery</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Multi-Bet System</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Draw In</p>
            <div className="bg-[#002b2b] px-4 py-1.5 rounded-2xl text-2xl font-black text-accent border border-accent/20">
              {timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
            </div>
          </div>
        </div>

        {/* Gemini Prediction */}
        <div className="bg-primary/40 border border-[#019d9d]/30 p-4 rounded-2xl mb-6 flex gap-3 items-center">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-xl animate-pulse">🔮</div>
          <div className="flex-1">
            <p className="text-[11px] text-white/80 leading-snug italic">"{isPredicting ? "Predicting..." : prediction}"</p>
            <button onClick={fetchPrediction} disabled={isPredicting} className="mt-1 text-[9px] font-black text-accent uppercase"><i className="fa-solid fa-sync mr-1"></i> Update Luck</button>
          </div>
        </div>

        {/* Current Active Bets Status */}
        {totalCurrentBet > 0 && (
          <div className="mb-4 bg-accent/20 border border-accent/30 p-2 rounded-xl text-center">
            <p className="text-[10px] font-black text-accent uppercase">Total Current Bets: ৳{totalCurrentBet}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {/* Fix: Explicitly casting Object.entries to handle potential type issues */}
              {(Object.entries(activeBets) as [string, number][]).map(([k,v]) => (
                <span key={k} className="text-[8px] bg-black/40 px-2 py-0.5 rounded text-white font-bold">{k}: ৳{v}</span>
              ))}
            </div>
          </div>
        )}

        {/* Amount Selector */}
        <div className="flex gap-2 mb-6 bg-black/20 p-1.5 rounded-2xl border border-white/5">
          {[10, 50, 100, 500, 1000].map(v => (
            <button 
              key={v}
              onClick={() => setSelectedAmount(v)}
              className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedAmount === v ? 'bg-accent text-primary shadow-lg' : 'text-gray-500'}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Color/Size Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button onClick={() => handleBet('GREEN')} className="bg-green-600 h-16 rounded-2xl text-white font-black text-lg border-b-4 border-green-800 active:scale-95 transition">GREEN</button>
          <button onClick={() => handleBet('RED')} className="bg-red-600 h-16 rounded-2xl text-white font-black text-lg border-b-4 border-red-800 active:scale-95 transition">RED</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => handleBet('BIG')} className="bg-[#003838] border border-accent/20 h-12 rounded-xl text-accent font-black text-sm">BIG (x2)</button>
          <button onClick={() => handleBet('SMALL')} className="bg-[#003838] border border-white/10 h-12 rounded-xl text-white font-black text-sm">SMALL (x2)</button>
        </div>

        {/* Number Betting Grid */}
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1">Specific Numbers (1:9 Odds)</p>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button 
                key={n}
                onClick={() => handleBet(`NUM_${n}`)}
                className={`aspect-square rounded-full border flex items-center justify-center font-black text-lg transition active:scale-90 ${
                  [0,2,4,6,8].includes(n) ? 'border-red-600 text-red-500' : 'border-green-600 text-green-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Draw History */}
      <div className="bg-secondary/40 rounded-[2.5rem] p-6 border border-white/5">
        <h3 className="text-xs font-black text-gray-500 uppercase mb-6 px-2 tracking-widest border-l-4 border-accent pl-4">Last Results</h3>
        <div className="grid grid-cols-5 gap-y-6 gap-x-2">
           {history.map((h, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom duration-300">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg ${h.color === 'RED' ? 'bg-red-600' : 'bg-green-600'}`}>
                 {h.number}
               </div>
               <span className="text-[8px] font-black text-gray-400">{h.size}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
