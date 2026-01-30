
import React from 'react';
import { useApp } from '../context/AppContext';

export const Header: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { currentUser, refreshBalance } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary flex items-center justify-between px-4 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="text-white text-xl">
          <i className="fa-solid fa-bars-staggered"></i>
        </button>
        <h1 className="text-xl font-bold text-accent tracking-tighter">CV666.COM</h1>
      </div>
      
      {currentUser && (
        <div className="flex items-center gap-3">
          <div className="bg-[#003838] px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
            <span className="text-white font-medium">৳ {currentUser.balance.toFixed(2)}</span>
            <button onClick={refreshBalance} className="text-accent animate-spin-slow">
              <i className="fa-solid fa-rotate-right"></i>
            </button>
          </div>
          <img 
            src={currentUser.avatar} 
            alt="avatar" 
            className="w-10 h-10 rounded-full border-2 border-accent"
          />
        </div>
      )}
    </header>
  );
};

export const BottomNav: React.FC<{ activeTab: string, setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'fa-house' },
    { id: 'promotion', label: 'Promotion', icon: 'fa-gift' },
    { id: 'invite', label: 'Invite', icon: 'fa-share-nodes', special: true },
    { id: 'reward', label: 'Reward', icon: 'fa-gem' },
    { id: 'profile', label: 'Member', icon: 'fa-user' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-primary flex items-center justify-around px-2 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] border-t border-white/5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center transition-all ${
            tab.special 
              ? 'relative -top-4 bg-[#019d9d] w-14 h-14 rounded-full shadow-lg border-4 border-[#011d1d]' 
              : ''
          } ${activeTab === tab.id ? 'text-accent' : 'text-gray-400'}`}
        >
          <i className={`fa-solid ${tab.icon} ${tab.special ? 'text-2xl text-white' : 'text-lg'}`}></i>
          {!tab.special && <span className="text-[10px] mt-1 font-semibold uppercase">{tab.label}</span>}
          {tab.special && <span className="absolute -bottom-6 text-[10px] font-semibold text-gray-400 uppercase">{tab.label}</span>}
        </button>
      ))}
    </nav>
  );
};
