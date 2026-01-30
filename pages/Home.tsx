
import React, { useState } from 'react';
import { Game } from '../types';
import { useApp } from '../context/AppContext';

const GAMES: Game[] = [
  { id: 'game_7updown', title: '7 Up 7 Down', provider: 'LIVE', category: 'LIVE', image: 'https://i.postimg.cc/J4LbXHy2/gcs-elott-SEAlott-1741932452761.webp' },
  { id: 'game_moneycoming', title: 'Money Coming', provider: 'JILI', category: 'SLOTS', image: 'https://i.postimg.cc/5tRBQPvm/KM0021.avif' },
  { id: 'game_superace', title: 'Super Ace', provider: 'JILI', category: 'SLOTS', image: 'https://i.postimg.cc/g0nRpv5D/JL0033.avif' },
  { id: 'game_crash', title: 'Aviator', provider: 'SPRIBE', category: 'CRASH', image: 'https://i.postimg.cc/J0WBjShJ/SPB002.webp' },
  { id: 'game_wildbounty', title: 'Wild Bounty', provider: 'PG SOFT', category: 'SLOTS', image: 'https://i.postimg.cc/v8WnG8qy/PG0113.avif' },
  { id: 'game_lottery', title: 'Color Prediction', provider: 'CV666', category: 'LOTTERY', image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_baji', title: 'Cricket Betting', provider: 'ELITE', category: 'MATCH', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop' },
];

export const Home: React.FC<{ onGameSelect: (id: string) => void, onWalletClick: () => void }> = ({ onGameSelect, onWalletClick }) => {
  const [activeCategory, setActiveCategory] = useState('HOT GAMES');
  const { adminSettings, claimGlobalBonus } = useApp();

  return (
    <div className="pb-24 pt-16">
      {/* Banner Section */}
      <div className="relative w-full h-56 bg-primary overflow-hidden mx-auto">
        <img 
          src="https://i.postimg.cc/7Y3ntn8x/1748183577854-photo-2025-05-25-22-32-13.jpg" 
          className="w-full h-full object-cover" 
          alt="CV666 Elite Banner" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-6">
          <h2 className="text-3xl font-black text-accent drop-shadow-2xl italic tracking-tighter uppercase leading-none">CV666 ELITE</h2>
          <p className="text-white font-bold text-xs uppercase tracking-widest mt-1 opacity-80">The Ultimate Gaming Hub</p>
        </div>
      </div>

      {/* Global Bonus Claim */}
      {adminSettings.globalClaimBonus > 0 && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-yellow-600/20 to-accent/20 border border-accent/20 p-4 rounded-2xl flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary shadow-lg border-2 border-white/20"><i className="fa-solid fa-gift text-2xl"></i></div>
             <div>
                <p className="text-[10px] font-black text-white uppercase italic leading-none opacity-60">Daily Reward</p>
                <p className="text-base font-black text-accent tracking-tighter">Claim ৳{adminSettings.globalClaimBonus} Free Bonus!</p>
             </div>
          </div>
          <button onClick={claimGlobalBonus} className="bg-accent text-primary px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow-[0_4px_15px_rgba(250,204,21,0.4)] hover:scale-105 transition active:scale-95">CLAIM</button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 p-4">
        <button onClick={onWalletClick} className="flex-1 bg-secondary hover:bg-[#024c4c] py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 transition shadow-lg group">
          <div className="bg-accent/10 p-2 rounded-xl group-hover:bg-accent group-hover:text-primary transition-all duration-300">
            <i className="fa-solid fa-wallet text-accent group-hover:text-inherit"></i>
          </div>
          <span className="font-black text-[11px] uppercase tracking-widest">Deposit</span>
        </button>
        <button onClick={onWalletClick} className="flex-1 bg-secondary hover:bg-[#024c4c] py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 transition shadow-lg group">
          <div className="bg-accent/10 p-2 rounded-xl group-hover:bg-accent group-hover:text-primary transition-all duration-300">
            <i className="fa-solid fa-money-bill-transfer text-accent group-hover:text-inherit"></i>
          </div>
          <span className="font-black text-[11px] uppercase tracking-widest">Withdraw</span>
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        {['HOT GAMES', 'LIVE', 'MATCHES', 'SLOTS', 'CRASH', 'LOTTERY'].map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)} 
            className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 border ${
              activeCategory === cat 
                ? 'bg-accent text-primary border-accent shadow-[0_0_15px_rgba(250,204,21,0.3)]' 
                : 'bg-secondary text-gray-400 border-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {GAMES.filter(g => activeCategory === 'HOT GAMES' || g.category === activeCategory).map(game => (
            <div key={game.id} onClick={() => onGameSelect(game.id)} className="game-card relative group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative transition-transform duration-300 group-hover:scale-[1.02]">
                <img src={game.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={game.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                {/* Provider Tag */}
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded-lg backdrop-blur-md border border-white/10">
                  <span className="text-[9px] font-black text-accent italic tracking-tighter uppercase">{game.provider}</span>
                </div>

                {/* Game Title */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-black text-white uppercase truncate drop-shadow-md leading-none">{game.title}</p>
                  <div className="w-8 h-1 bg-accent mt-1 rounded-full group-hover:w-16 transition-all duration-300"></div>
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                   <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                      <i className="fa-solid fa-play text-xl ml-1"></i>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
