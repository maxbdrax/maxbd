
import React, { useState } from 'react';
import { Game } from '../types';
import { useApp } from '../context/AppContext';

const GAMES: Game[] = [
  { id: 'game_7updown', title: '7 Up 7 Down', provider: 'JILI', category: 'LIVE', image: 'https://images.unsplash.com/photo-1596838132731-dd96a3375935?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_baji', title: 'Create Baji', provider: 'CV ADMIN', category: 'MATCH', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_wildbounty', title: 'Wild Bounty Showdown', provider: 'PG', category: 'SLOTS', image: 'https://images.unsplash.com/photo-1533157577004-bb57bbcd11a0?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_superace', title: 'Super Ace', provider: 'JILI', category: 'SLOTS', image: 'https://images.unsplash.com/photo-1596838132731-dd96a3375935?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_crash', title: 'Aviator', provider: 'SPRIBE', category: 'CRASH', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_lottery', title: 'Color Prediction', provider: 'CV666', category: 'LOTTERY', image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=400&auto=format&fit=crop' },
];

export const Home: React.FC<{ onGameSelect: (id: string) => void, onWalletClick: () => void }> = ({ onGameSelect, onWalletClick }) => {
  const [activeCategory, setActiveCategory] = useState('HOT GAMES');
  const { adminSettings, claimGlobalBonus } = useApp();

  return (
    <div className="pb-24 pt-16">
      <div className="relative w-full h-48 bg-gradient-to-r from-[#003838] to-[#015252] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1596838132731-dd96a3375935?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="banner" />
        <div className="absolute inset-0 p-6 flex flex-col justify-center">
          <h2 className="text-2xl font-black text-accent drop-shadow-lg italic tracking-tighter uppercase">Mega CV666 Hub</h2>
          <p className="text-white font-bold text-sm">Play Elite Games & Earn ৳৳৳</p>
          <p className="text-yellow-400 text-lg font-bold">৳1,000,000 BONUS RAIN</p>
          <button className="mt-2 bg-accent text-[#011d1d] font-black py-1 px-4 rounded-full text-xs self-start shadow-lg">JOIN ELITE</button>
        </div>
      </div>

      {adminSettings.globalClaimBonus > 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-yellow-600/20 to-accent/20 border border-accent/20 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-primary shadow-lg"><i className="fa-solid fa-gift text-xl"></i></div>
             <div>
                <p className="text-xs font-black text-white uppercase italic leading-none">Special Reward</p>
                <p className="text-sm font-black text-accent tracking-tighter">Claim ৳{adminSettings.globalClaimBonus} Today!</p>
             </div>
          </div>
          <button onClick={claimGlobalBonus} className="bg-accent text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg hover:scale-105 transition">CLAIM</button>
        </div>
      )}

      <div className="flex gap-4 p-4">
        <button onClick={onWalletClick} className="flex-1 bg-secondary hover:bg-[#024c4c] py-3 rounded-xl flex items-center justify-center gap-3 border border-white/5 transition shadow-md">
          <div className="bg-[#eab308]/20 p-2 rounded-lg"><i className="fa-solid fa-wallet text-accent"></i></div>
          <span className="font-bold text-sm">Deposit</span>
        </button>
        <button onClick={onWalletClick} className="flex-1 bg-secondary hover:bg-[#024c4c] py-3 rounded-xl flex items-center justify-center gap-3 border border-white/5 transition shadow-md">
          <div className="bg-[#eab308]/20 p-2 rounded-lg"><i className="fa-solid fa-money-bill-transfer text-accent"></i></div>
          <span className="font-bold text-sm">Withdraw</span>
        </button>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {['HOT GAMES', 'LIVE', 'MATCHES', 'SLOTS', 'CRASH', 'LOTTERY'].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${activeCategory === cat ? 'bg-[#019d9d] text-white' : 'bg-secondary text-gray-400'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GAMES.filter(g => activeCategory === 'HOT GAMES' || g.category === activeCategory).map(game => (
            <div key={game.id} onClick={() => onGameSelect(game.id)} className="game-card relative group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-white/10 relative">
                <img src={game.image} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" alt={game.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                  <span className="text-[10px] font-black text-white italic tracking-tighter">{game.provider}</span>
                </div>
                <div className="absolute bottom-2 left-2 right-2"><p className="text-xs font-black text-white uppercase truncate drop-shadow-md">{game.title}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
