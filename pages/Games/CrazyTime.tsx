
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

interface Segment {
  label: string;
  multiplier: number;
  color: string;
  textColor: string;
}

const SEGMENT_TYPES: Record<string, Segment> = {
  '1': { label: '1', multiplier: 1, color: '#3b82f6', textColor: 'text-white' }, // Blue
  '2': { label: '2', multiplier: 2, color: '#facc15', textColor: 'text-primary' }, // Yellow
  '5': { label: '5', multiplier: 5, color: '#ec4899', textColor: 'text-white' }, // Pink
  '10': { label: '10', multiplier: 10, color: '#9333ea', textColor: 'text-white' }, // Purple
  'COIN FLIP': { label: 'CF', multiplier: 15, color: '#60a5fa', textColor: 'text-white' },
  'PACHINKO': { label: 'PK', multiplier: 25, color: '#f472b6', textColor: 'text-white' },
  'CASH HUNT': { label: 'CH', multiplier: 50, color: '#22c55e', textColor: 'text-white' },
  'CRAZY TIME': { label: 'CT', multiplier: 100, color: '#ef4444', textColor: 'text-white' }
};

// Official Crazy Time wheel has 54 segments
const WHEEL_LAYOUT = [
  '1', '2', '1', '5', '1', '2', '1', '10', '1', '2', '1', 'COIN FLIP', 
  '1', '2', '1', '5', '1', '2', '1', 'PACHINKO', '1', '2', '1', '5', 
  '1', '2', '1', '10', '1', '2', '1', 'CASH HUNT', '1', '2', '1', '5', 
  '1', '2', '1', 'COIN FLIP', '1', '2', '1', '5', '1', '2', '1', '10', 
  '1', '2', '1', 'PACHINKO', '1', '2', 'CRAZY TIME'
];

export const CrazyTime: React.FC = () => {
  const { currentUser, updateUserBalance, addBetRecord } = useApp();
  const [activeBets, setActiveBets] = useState<Record<string, number>>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedChip, setSelectedChip] = useState(10);
  const [lastWin, setLastWin] = useState(0);
  const [clapperTick, setClapperTick] = useState(false);
  const [winningSegment, setWinningSegment] = useState<string | null>(null);

  const spin = () => {
    const totalBet = (Object.values(activeBets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet <= 0 || isSpinning || !currentUser) return;

    setIsSpinning(true);
    setWinningSegment(null);
    setLastWin(0);

    // Standard 54 segments, 360/54 degrees per segment
    const segmentAngle = 360 / WHEEL_LAYOUT.length;
    const stopAt = Math.floor(Math.random() * WHEEL_LAYOUT.length);
    
    // Calculate new rotation (at least 5 full spins + target segment offset)
    const newRotation = rotation + (360 * 5) + (stopAt * segmentAngle) + (segmentAngle / 2);
    setRotation(newRotation);

    // Simulate clapper ticking during spin
    const tickInterval = setInterval(() => {
        setClapperTick(prev => !prev);
    }, 100);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      
      // Calculate which segment it landed on based on the final rotation
      // Pointer is at the top (0 degrees). We need to reverse the index.
      const actualStopAt = WHEEL_LAYOUT.length - 1 - (stopAt % WHEEL_LAYOUT.length);
      const resultKey = WHEEL_LAYOUT[stopAt]; // Simplified landing logic
      const result = SEGMENT_TYPES[resultKey];
      
      setWinningSegment(resultKey);
      
      let totalWin = 0;
      if (activeBets[resultKey]) {
        totalWin = activeBets[resultKey] * (result.multiplier + 1);
        updateUserBalance(currentUser.id, currentUser.balance + totalWin);
        setLastWin(totalWin);
        addBetRecord(currentUser.id, 'Crazy Time', totalBet, totalWin, 'WIN', `Won on ${resultKey}`);
      } else {
        addBetRecord(currentUser.id, 'Crazy Time', totalBet, 0, 'LOSS', `Lost on ${resultKey}`);
      }
      
      // Clear bets after a short delay
      setTimeout(() => setActiveBets({}), 2000);
    }, 5000);
  };

  const handleBet = (label: string) => {
    if (!currentUser || isSpinning) return;
    if (currentUser.balance < selectedChip) return alert("Insufficient balance!");
    updateUserBalance(currentUser.id, currentUser.balance - selectedChip);
    setActiveBets(prev => ({ ...prev, [label]: (prev[label] || 0) + selectedChip }));
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto bg-[#0a0a0a] min-h-screen text-white">
      <div className="bg-gradient-to-b from-[#3d0505] to-[#121212] rounded-[3rem] p-6 border-4 border-[#ffd700]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
        
        <h2 className="text-4xl font-black text-accent text-center italic uppercase mb-8 drop-shadow-lg tracking-tighter">
            Crazy <span className="text-white">Time</span>
        </h2>
        
        {/* Wheel Container */}
        <div className="flex justify-center mb-10 relative">
          {/* Professional Clapper */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30 transition-transform duration-75 ${clapperTick ? 'rotate-12' : '-rotate-12'}`}>
            <div className="w-10 h-14 bg-gradient-to-b from-red-500 to-red-800 clip-path-polygon-[0%_0%,100%_0%,50%_100%] border-2 border-white shadow-xl"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full -mt-2 border-2 border-red-900"></div>
          </div>

          {/* The Wheel */}
          <div className="relative p-2 bg-gradient-to-br from-yellow-600 via-yellow-400 to-yellow-800 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.2)] border-8 border-black/40">
            <div 
                className="w-72 h-72 rounded-full transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.1, 1) relative overflow-hidden"
                style={{ 
                    transform: `rotate(-${rotation}deg)`,
                    background: '#111'
                }}
            >
                {/* Wheel Segments Mapping */}
                {WHEEL_LAYOUT.map((key, i) => {
                    const segment = SEGMENT_TYPES[key];
                    const angle = 360 / WHEEL_LAYOUT.length;
                    return (
                        <div 
                            key={i}
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1/2 origin-bottom flex flex-col items-center pt-2"
                            style={{ 
                                transform: `rotate(${i * angle}deg)`,
                                backgroundColor: segment.color,
                                clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)'
                            }}
                        >
                            <span className={`text-[8px] font-black transform rotate-180 uppercase ${segment.textColor}`}>{segment.label}</span>
                        </div>
                    );
                })}

                {/* Center Hub */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent to-yellow-700 rounded-full border-4 border-white flex items-center justify-center shadow-2xl z-20">
                        <div className="text-center">
                            <p className="text-[10px] font-black text-primary uppercase leading-none">CV</p>
                            <p className="text-xs font-black text-primary leading-none">ELITE</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Win / Result Status */}
        <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/5 flex flex-col items-center">
           {winningSegment ? (
               <div className="animate-bounce">
                   <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Result</p>
                   <p className={`text-4xl font-black italic uppercase ${SEGMENT_TYPES[winningSegment].textColor}`}>{winningSegment}</p>
               </div>
           ) : isSpinning ? (
               <p className="text-xl font-black text-accent animate-pulse uppercase italic tracking-tighter">Spinning...</p>
           ) : (
               <>
                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Your Last Win</p>
                   <p className="text-3xl font-black text-accent italic">৳{lastWin.toFixed(2)}</p>
               </>
           )}
        </div>

        {/* Betting Grid - Professional Layout */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {Object.entries(SEGMENT_TYPES).map(([key, s]) => (
            <button 
              key={key}
              onClick={() => handleBet(key)}
              className={`relative h-16 rounded-2xl border-b-4 border-black/40 flex flex-col items-center justify-center p-1 active:scale-95 transition-all shadow-lg overflow-hidden group ${
                winningSegment === key ? 'ring-4 ring-white animate-pulse' : ''
              }`}
              style={{ backgroundColor: s.color }}
            >
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition"></div>
              <span className={`text-[10px] font-black uppercase text-center leading-tight relative z-10 ${s.textColor}`}>{key}</span>
              <span className={`text-[8px] font-black relative z-10 opacity-70 ${s.textColor}`}>PAY x{s.multiplier}</span>
              
              {activeBets[key] && (
                <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded-full text-[7px] font-black text-accent border border-accent/30">
                  ৳{activeBets[key]}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="bg-black/60 p-4 rounded-3xl border border-white/5 flex gap-4 items-center shadow-inner">
           <div className="flex-1 grid grid-cols-3 gap-2">
             {[10, 50, 100].map(v => (
               <button 
                key={v} 
                onClick={() => setSelectedChip(v)} 
                className={`py-2.5 rounded-xl text-[11px] font-black border-2 transition-all ${
                    selectedChip === v 
                    ? 'bg-accent text-primary border-white shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                    : 'bg-white/5 text-gray-400 border-white/5'
                }`}
               >
                 ৳{v}
               </button>
             ))}
           </div>
           <button 
            onClick={spin} 
            disabled={isSpinning}
            className={`w-28 h-12 rounded-xl font-black text-xs uppercase shadow-2xl transition active:scale-90 flex items-center justify-center gap-2 ${
                isSpinning ? 'bg-gray-700 text-gray-500' : 'bg-gradient-to-r from-green-500 to-green-700 text-white'
            }`}
           >
             <i className={`fa-solid fa-rotate ${isSpinning ? 'animate-spin' : ''}`}></i>
             {isSpinning ? 'WAIT' : 'SPIN'}
           </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 px-4 flex justify-between items-center opacity-60">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Standard Casino Rules Apply</div>
          <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase">Server Live</span>
          </div>
      </div>
    </div>
  );
};
