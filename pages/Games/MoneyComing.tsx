
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const PRIZES = [100, 500, 1000, 200, 50, 1000, 300, 5000];

export const MoneyComing: React.FC = () => {
  const { currentUser, updateUserBalance, addBetRecord } = useApp();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reels, setReels] = useState([0, 0, 0]);
  const [bet, setBet] = useState(10);
  const [winAmount, setWinAmount] = useState(0);

  const spin = () => {
    if (!currentUser || isSpinning) return;
    if (currentUser.balance < bet) {
      alert("Insufficient balance!");
      return;
    }

    updateUserBalance(currentUser.id, currentUser.balance - bet);
    setIsSpinning(true);
    setWinAmount(0);

    const spinInterval = setInterval(() => {
      setReels([Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)]);
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      const newRotation = rotation + 1440 + Math.floor(Math.random() * 360);
      setRotation(newRotation);

      const isWin = Math.random() > 0.4;
      let finalWin = 0;
      let finalReels = [0, 0, 0];

      if (isWin) {
        const prizeIndex = Math.floor((newRotation % 360) / (360 / PRIZES.length));
        const multiplier = Math.random() > 0.8 ? 5 : 1;
        finalWin = (PRIZES[prizeIndex] / 10) * multiplier;
        finalReels = [Math.floor(Math.random() * 10), multiplier > 1 ? 5 : 1, Math.floor(Math.random() * 10)];
      }

      setReels(finalReels);
      
      setTimeout(() => {
        setIsSpinning(false);
        if (finalWin > 0) {
          setWinAmount(finalWin);
          updateUserBalance(currentUser.id, currentUser.balance + finalWin);
          addBetRecord(currentUser.id, 'Money Coming', bet, finalWin, 'WIN', `Won on wheel spin`);
        } else {
          addBetRecord(currentUser.id, 'Money Coming', bet, 0, 'LOSS', `No prize landed`);
        }
      }, 2500);
    }, 500);
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#2b0a0a] min-h-screen">
      <div className="relative aspect-[3/4.5] bg-[#3d0d0d] rounded-[2.5rem] border-4 border-[#ffd700] shadow-[0_0_40px_rgba(255,215,0,0.2)] overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute top-4 left-0 bg-[#ffd700] text-[#3d0d0d] px-4 py-1 rounded-r-full font-black text-[10px] z-20 shadow-lg">JILI</div>
        <div className="relative z-10 pt-6 text-center">
          <h2 className="text-4xl font-black text-white italic drop-shadow-[0_4px_0_#ff0000] tracking-tighter uppercase">Money Coming</h2>
        </div>
        <div className="relative z-10 flex justify-center mt-6">
          <div className="relative">
            <div className="w-56 h-56 rounded-full border-[10px] border-[#ffd700] relative transition-transform duration-[2500ms] cubic-bezier(0.15, 0, 0.15, 1) shadow-[0_0_30px_rgba(255,215,0,0.4)]"
              style={{ transform: `rotate(${rotation}deg)`, background: 'conic-gradient(#006400 0deg 45deg, #ffd700 45deg 90deg, #b22222 90deg 135deg, #ffd700 135deg 180deg, #006400 180deg 225deg, #ffd700 225deg 270deg, #b22222 270deg 315deg, #ffd700 315deg 360deg)' }}>
              {PRIZES.map((p, i) => (<div key={i} className="absolute inset-0 flex items-start justify-center pt-5 font-black text-[#1a1a1a] text-[10px]" style={{ transform: `rotate(${i * 45 + 22.5}deg)` }}>{p}</div>))}
              <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-gradient-to-b from-[#ffd700] to-[#b8860b] rounded-full border-4 border-white flex items-center justify-center shadow-xl"><span className="text-4xl font-black text-red-700">$</span></div></div>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20 w-8 h-10 bg-red-600 clip-path-polygon-[0%_0%,100%_0%,50%_100%] border-2 border-white shadow-lg"></div>
          </div>
        </div>
        <div className="relative z-10 mt-10 px-8">
           <div className="bg-gradient-to-b from-[#ffd700] via-[#b8860b] to-[#ffd700] p-1.5 rounded-2xl shadow-2xl">
             <div className="bg-[#004d00] h-24 rounded-xl flex gap-1.5 p-1.5 border-inner shadow-inner">
                {reels.map((val, i) => (<div key={i} className="flex-1 bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200"><span className={`text-5xl font-black text-red-600 transition-all ${isSpinning ? 'animate-bounce' : ''}`}>{val}</span></div>))}
             </div>
           </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-10 pb-6 px-6">
          <div className="flex justify-between items-end mb-6">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Winnings</p>
                <div className="bg-black/60 px-4 py-1.5 rounded-lg border border-[#ffd700]/30 min-w-[100px]"><p className="text-xl font-black text-[#ffd700] italic">৳{winAmount.toFixed(2)}</p></div>
             </div>
             <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Balance</p>
                <p className="text-sm font-black text-white italic tracking-tighter">৳ {currentUser?.balance.toFixed(2)}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex-1 grid grid-cols-3 gap-2">
                {[10, 50, 100].map(v => (<button key={v} onClick={() => setBet(v)} className={`py-3 rounded-xl font-black text-xs transition-all border-b-4 ${bet === v ? 'bg-[#ffd700] text-black border-yellow-700 scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'bg-white/10 text-gray-400 border-black/40'}`}>৳{v}</button>))}
             </div>
             <button onClick={spin} disabled={isSpinning} className="w-24 h-24 bg-gradient-to-b from-green-400 to-green-800 rounded-full border-4 border-white shadow-[0_10px_30px_rgba(34,197,94,0.4)] flex items-center justify-center active:scale-90 transition group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                <div className={`w-18 h-18 bg-green-500 rounded-full flex items-center justify-center border-2 border-white/50 group-hover:scale-110 transition-all ${isSpinning ? 'animate-pulse' : ''}`}><span className="text-white font-black text-sm italic tracking-tighter leading-tight text-center">{isSpinning ? 'SPINNING' : 'SPIN\nSTART'}</span></div>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
