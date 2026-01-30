
import React, { useState } from 'react';
import { Game } from '../types';
import { useApp } from '../context/AppContext';

const GAMES: Game[] = [
  { id: 'game_crazytime', title: 'Crazy Time', provider: 'EVOLUTION', category: 'LIVE', image: 'https://images.unsplash.com/photo-1596838132731-dd96a3375935?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_fortunegems', title: 'Fortune Gems 3', provider: 'JILI', category: 'SLOTS', image: 'https://i.postimg.cc/mD8x1h6m/fortunegems.jpg' },
  { id: 'game_7updown', title: '7 Up 7 Down', provider: 'LIVE', category: 'LIVE', image: 'https://i.postimg.cc/J4LbXHy2/gcs-elott-SEAlott-1741932452761.webp' },
  { id: 'game_moneycoming', title: 'Money Coming', provider: 'JILI', category: 'SLOTS', image: 'https://i.postimg.cc/5tRBQPvm/KM0021.avif' },
  { id: 'game_superace', title: 'Super Ace', provider: 'JILI', category: 'SLOTS', image: 'https://i.postimg.cc/g0nRpv5D/JL0033.avif' },
  { id: 'game_crash', title: 'Aviator', provider: 'SPRIBE', category: 'CRASH', image: 'https://i.postimg.cc/J0WBjShJ/SPB002.webp' },
  { id: 'game_wildbounty', title: 'Wild Bounty', provider: 'PG SOFT', category: 'SLOTS', image: 'https://i.postimg.cc/v8WnG8qy/PG0113.avif' },
  { id: 'game_lottery', title: 'Color Prediction', provider: 'MAX999', category: 'LOTTERY', image: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?q=80&w=400&auto=format&fit=crop' },
  { id: 'game_baji', title: 'Cricket Betting', provider: 'ELITE', category: 'MATCH', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop' },
];

export const Home: React.FC<{ onGameSelect: (id: string) => void, onWalletClick: () => void }> = ({ onGameSelect, onWalletClick }) => {
  const [activeCategory, setActiveCategory] = useState('HOT GAMES');
  const { adminSettings, claimGlobalBonus, globalNotifications } = useApp();

  return (
    <div className="pb-24 pt-16">
      {/* Global Broadcast Marquee */}
      {globalNotifications.length > 0 && (
        <div className="bg-[#002b2b] border-b border-accent/20 py-2 overflow-hidden flex items-center">
           <div className="bg-accent text-primary px-3 py-0.5 text-[9px] font-black uppercase italic ml-2 rounded z-10 shadow-lg">NOTICE</div>
           <div className="whitespace-nowrap flex animate-marquee">
              {globalNotifications.map(n => (
                <span key={n.id} className="text-white text-[11px] font-bold mx-8 flex items-center gap-2">
                   <i className={`fa-solid ${n.type === 'ALERT' ? 'fa-triangle-exclamation text-red-500' : 'fa-bullhorn text-accent'}`}></i>
                   {n.message}
                </span>
              ))}
              {/* Duplicate for seamless marquee effect */}
              {globalNotifications.map(n => (
                <span key={n.id + '_dup'} className="text-white text-[11px] font-bold mx-8 flex items-center gap-2">
                   <i className={`fa-solid ${n.type === 'ALERT' ? 'fa-triangle-exclamation text-red-500' : 'fa-bullhorn text-accent'}`}></i>
                   {n.message}
                </span>
              ))}
           </div>
        </div>
      )}

      {/* Banner Section */}
      <div className="relative w-full h-56 bg-primary overflow-hidden">
        <img src="https://i.postimg.cc/7Y3ntn8x/1748183577854-photo-2025-05-25-22-32-13.jpg" className="w-full h-full object-cover" alt="Banner" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-6">
          <h2 className="text-3xl font-black text-accent drop-shadow-2xl italic tracking-tighter uppercase leading-none">MAX999 ELITE</h2>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 p-4">
        <button onClick={onWalletClick} className="flex-1 bg-secondary py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 shadow-lg group">
          <i className="fa-solid fa-wallet text-accent text-xl"></i>
          <span className="font-black text-[11px] uppercase tracking-widest">Deposit</span>
        </button>
        <button onClick={onWalletClick} className="flex-1 bg-secondary py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-white/5 shadow-lg group">
          <i className="fa-solid fa-money-bill-transfer text-accent text-xl"></i>
          <span className="font-black text-[11px] uppercase tracking-widest">Withdraw</span>
        </button>
      </div>

      {/* Games Category List ... (Games rendering logic) */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GAMES.filter(g => activeCategory === 'HOT GAMES' || g.category === activeCategory).map(game => (
            <div key={game.id} onClick={() => onGameSelect(game.id)} className="game-card relative group cursor-pointer aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-xl">
              <img src={game.image} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt={game.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <p className="text-[10px] font-black text-white uppercase truncate">{game.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
