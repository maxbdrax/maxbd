
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

enum GameState {
  WAITING,
  RUNNING,
  CRASHED
}

interface BetStatus {
  amount: number;
  isPlaced: boolean;
  hasCashedOut: boolean;
  winAmount: number;
}

export const CrashGame: React.FC = () => {
  const { currentUser, updateUserBalance } = useApp();
  const [gameState, setGameState] = useState<GameState>(GameState.WAITING);
  const [multiplier, setMultiplier] = useState(1.0);
  const [timer, setTimer] = useState(5);
  const [history, setHistory] = useState<number[]>([1.21, 5.52, 1.03, 53.56, 1.17]);

  // Dual Betting Slots
  const [slot1, setSlot1] = useState<BetStatus>({ amount: 10, isPlaced: false, hasCashedOut: false, winAmount: 0 });
  const [slot2, setSlot2] = useState<BetStatus>({ amount: 10, isPlaced: false, hasCashedOut: false, winAmount: 0 });

  const gameInterval = useRef<any>(null);

  const startRound = () => {
    setGameState(GameState.RUNNING);
    setMultiplier(1.0);
    // Fairly random crash point with some "big wins" possible
    const crashPoint = 1 + Math.random() * 3 + (Math.random() > 0.9 ? 15 : 0) + (Math.random() > 0.98 ? 50 : 0);
    
    gameInterval.current = setInterval(() => {
      setMultiplier(prev => {
        const next = prev + 0.006 * (prev / 1.4);
        if (next >= crashPoint) {
          clearInterval(gameInterval.current);
          setGameState(GameState.CRASHED);
          setHistory(h => [parseFloat(next.toFixed(2)), ...h.slice(0, 7)]);
          
          // If they didn't cash out, they lose. Reset betting status for next round after a delay.
          setTimeout(() => {
            resetBets();
            setGameState(GameState.WAITING);
            setTimer(5);
          }, 3000);

          return next;
        }
        return next;
      });
    }, 45);
  };

  const resetBets = () => {
    setSlot1(prev => ({ ...prev, isPlaced: false, hasCashedOut: false, winAmount: 0 }));
    setSlot2(prev => ({ ...prev, isPlaced: false, hasCashedOut: false, winAmount: 0 }));
  };

  useEffect(() => {
    if (gameState === GameState.WAITING) {
      const t = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(t);
            startRound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(t);
    }
  }, [gameState]);

  const handlePlaceBet = (slotNum: 1 | 2) => {
    if (!currentUser || gameState !== GameState.WAITING) return;
    
    const slot = slotNum === 1 ? slot1 : slot2;
    if (slot.isPlaced) return;
    if (currentUser.balance < slot.amount) {
      alert("Insufficient balance!");
      return;
    }

    updateUserBalance(currentUser.id, currentUser.balance - slot.amount);
    if (slotNum === 1) setSlot1({ ...slot1, isPlaced: true });
    else setSlot2({ ...slot2, isPlaced: true });
  };

  const handleCashOut = (slotNum: 1 | 2) => {
    if (gameState !== GameState.RUNNING || !currentUser) return;
    
    const slot = slotNum === 1 ? slot1 : slot2;
    if (!slot.isPlaced || slot.hasCashedOut) return;

    const win = slot.amount * multiplier;
    updateUserBalance(currentUser.id, currentUser.balance + win);
    
    if (slotNum === 1) setSlot1({ ...slot1, hasCashedOut: true, winAmount: win });
    else setSlot2({ ...slot2, hasCashedOut: true, winAmount: win });
  };

  const updateAmount = (slotNum: 1 | 2, val: number) => {
    if (gameState !== GameState.WAITING) return;
    if (slotNum === 1) setSlot1({ ...slot1, amount: val });
    else setSlot2({ ...slot2, amount: val });
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#0a0b0c] min-h-screen text-white font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 bg-white/5 p-4 rounded-3xl border border-white/10 shadow-2xl">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse border-2 border-white/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
             <i className="fa-solid fa-plane text-white text-sm"></i>
           </div>
           <div>
             <h2 className="text-lg font-black text-white italic tracking-tighter leading-none">AVIATOR</h2>
             <p className="text-[8px] text-gray-500 font-bold uppercase mt-1 tracking-widest">Real-time Multiplier</p>
           </div>
         </div>
         <div className="bg-black/60 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
            <span className="text-green-500 font-black text-sm italic tracking-tighter">৳ {currentUser?.balance.toFixed(2)}</span>
         </div>
      </div>

      {/* History */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-2">
         {history.map((h, i) => (
           <div key={i} className={`px-4 py-1.5 rounded-full text-[10px] font-black border transition shrink-0 ${h > 2 ? 'bg-purple-600/30 text-purple-400 border-purple-500/30' : 'bg-blue-600/30 text-blue-400 border-blue-500/30'}`}>
              {h.toFixed(2)}x
           </div>
         ))}
      </div>

      {/* Main Graph Area */}
      <div className="relative aspect-[1.4/1] bg-[#141518] rounded-[2.5rem] overflow-hidden border border-white/10 mb-6 shadow-2xl">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#2a1b1b_0%,_#141518_70%)] opacity-50"></div>
         <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)' }}></div>

         <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {gameState === GameState.WAITING ? (
              <div className="text-center animate-in fade-in duration-500">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">WAITING FOR NEXT ROUND</p>
                <div className="relative inline-block">
                  <p className="text-7xl font-black text-white drop-shadow-2xl">{timer}s</p>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/30 rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${(timer/5)*100}%` }}></div>
                  </div>
                </div>
              </div>
            ) : gameState === GameState.CRASHED ? (
              <div className="text-center">
                <p className="text-red-500 font-black uppercase text-3xl italic tracking-tighter drop-shadow-lg scale-up-center">FLEW AWAY!</p>
                <p className="text-white font-bold text-5xl mt-2 drop-shadow-md">{multiplier.toFixed(2)}x</p>
              </div>
            ) : (
              <div className="text-center">
                 <p className="text-8xl font-black italic tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                    {multiplier.toFixed(2)}<span className="text-4xl ml-1 text-white/50">x</span>
                 </p>
              </div>
            )}
         </div>

         {/* Flight Icon */}
         {gameState === GameState.RUNNING && (
           <div 
             className="absolute bottom-12 left-12 transition-all duration-300 ease-linear z-20"
             style={{ 
               transform: `translate(${Math.min(multiplier * 30, 300)}px, -${Math.min(multiplier * 22, 220)}px)`
             }}
           >
             <div className="relative">
                <div className="w-14 h-14 bg-red-600 rounded-full shadow-[0_0_35px_rgba(239,68,68,1)] flex items-center justify-center border-2 border-white/60">
                  <i className="fa-solid fa-plane-up text-white text-2xl drop-shadow-lg"></i>
                </div>
                <div className="absolute top-1/2 right-full w-40 h-8 bg-gradient-to-r from-transparent via-red-600/30 to-red-600/50 rounded-full blur-md -translate-y-1/2 transform -rotate-[12deg] origin-right pointer-events-none"></div>
             </div>
           </div>
         )}
         
         {gameState === GameState.RUNNING && (
           <svg className="absolute inset-0 w-full h-full pointer-events-none">
             <path 
              d={`M 48, ${280} Q 150, ${280 - multiplier * 12} ${Math.min(48 + multiplier * 30, 348)}, ${280 - multiplier * 22}`} 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="5" 
              strokeLinecap="round"
              className="drop-shadow-[0_0_15px_rgba(239,68,68,0.7)]"
             />
           </svg>
         )}
      </div>

      {/* Betting Panels */}
      <div className="grid grid-cols-1 gap-6">
        {[1, 2].map((num) => {
          const slot = num === 1 ? slot1 : slot2;
          const isBettingDisabled = gameState !== GameState.WAITING || slot.isPlaced;
          const isCashOutEnabled = gameState === GameState.RUNNING && slot.isPlaced && !slot.hasCashedOut;

          return (
            <div key={num} className="bg-[#1b1c1e] p-5 rounded-[2.5rem] border border-white/10 shadow-xl flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full space-y-3">
                 <div className="flex items-center justify-between bg-black/60 px-4 py-3 rounded-2xl border border-white/10">
                    <button 
                      onClick={() => updateAmount(num as any, Math.max(1, slot.amount - 10))} 
                      disabled={gameState !== GameState.WAITING}
                      className="w-10 h-10 rounded-full bg-white/5 text-white hover:bg-white/10 active:scale-90 transition disabled:opacity-30"
                    >
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <input 
                      type="number" 
                      value={slot.amount}
                      onChange={(e) => updateAmount(num as any, parseInt(e.target.value) || 0)}
                      disabled={gameState !== GameState.WAITING}
                      className="w-20 bg-transparent text-center font-black text-2xl outline-none"
                    />
                    <button 
                      onClick={() => updateAmount(num as any, slot.amount + 10)} 
                      disabled={gameState !== GameState.WAITING}
                      className="w-10 h-10 rounded-full bg-white/5 text-white hover:bg-white/10 active:scale-90 transition disabled:opacity-30"
                    >
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                 </div>
                 <div className="grid grid-cols-4 gap-2">
                    {[10, 50, 100, 500].map(v => (
                      <button 
                        key={v} 
                        onClick={() => updateAmount(num as any, v)} 
                        disabled={gameState !== GameState.WAITING}
                        className="bg-white/5 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:text-white transition disabled:opacity-30"
                      >
                        ৳{v}
                      </button>
                    ))}
                 </div>
              </div>

              {isCashOutEnabled ? (
                <button 
                  onClick={() => handleCashOut(num as any)}
                  className="w-full md:w-36 h-32 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 rounded-[2rem] flex flex-col items-center justify-center shadow-[0_15px_40px_rgba(249,115,22,0.4)] active:scale-95 transition-all border-b-8 border-orange-900"
                >
                   <span className="text-[11px] font-black uppercase text-white/80 mb-1 tracking-widest">CASH OUT</span>
                   <span className="text-2xl font-black tracking-tighter">৳{(slot.amount * multiplier).toFixed(1)}</span>
                </button>
              ) : slot.hasCashedOut ? (
                <div className="w-full md:w-36 h-32 bg-green-600/20 border-2 border-green-500/40 rounded-[2rem] flex flex-col items-center justify-center">
                   <span className="text-[9px] font-black uppercase text-green-400 mb-1 tracking-widest">CASHED OUT</span>
                   <span className="text-xl font-black text-white">৳{slot.winAmount.toFixed(1)}</span>
                </div>
              ) : (
                <button 
                  onClick={() => handlePlaceBet(num as any)}
                  disabled={isBettingDisabled}
                  className={`w-full md:w-36 h-32 rounded-[2rem] flex flex-col items-center justify-center shadow-lg transition-all active:scale-95 border-b-8 ${
                    slot.isPlaced 
                    ? 'bg-gray-600 border-gray-800' 
                    : 'bg-gradient-to-br from-green-500 via-green-600 to-green-800 border-green-900 shadow-[0_15px_40px_rgba(34,197,94,0.3)]'
                  } disabled:opacity-50`}
                >
                   <span className="text-[11px] font-black uppercase text-white/80 mb-1 tracking-widest">
                     {slot.isPlaced ? (gameState === GameState.WAITING ? 'WAITING' : 'IN FLIGHT') : 'BET'}
                   </span>
                   <span className="text-2xl font-black tracking-tighter">৳{slot.amount}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
