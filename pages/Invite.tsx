
import React from 'react';
import { useApp } from '../context/AppContext';

export const Invite: React.FC = () => {
  const { currentUser, adminSettings } = useApp();

  if (!currentUser) return null;

  const referralLink = `${window.location.origin}/signup?ref=${currentUser.referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#019d9d] to-[#015252] p-8 rounded-[2.5rem] shadow-2xl text-center">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <i className="fa-solid fa-users text-9xl"></i>
        </div>
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Refer & Earn</h2>
        <p className="text-white/80 text-sm font-bold">Invite your friends and earn <span className="text-accent">{adminSettings.referralCommission}%</span> commission on their bets forever!</p>
        
        <div className="mt-8 bg-black/30 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex flex-col items-center">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Your Referral Code</p>
          <div className="flex items-center gap-4">
             <span className="text-4xl font-black text-white tracking-widest">{currentUser.referralCode}</span>
             <button onClick={() => copyToClipboard(currentUser.referralCode)} className="bg-accent text-primary p-2 rounded-xl hover:scale-110 transition">
               <i className="fa-solid fa-copy"></i>
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-secondary p-5 rounded-3xl border border-white/5 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Total Invites</p>
            <p className="text-2xl font-black text-white italic">{currentUser.referralCount}</p>
         </div>
         <div className="bg-secondary p-5 rounded-3xl border border-white/5 text-center">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Passive Income</p>
            <p className="text-2xl font-black text-blue-400 italic">৳{currentUser.commission.toFixed(2)}</p>
         </div>
      </div>

      <div className="bg-secondary p-6 rounded-3xl border border-white/5 space-y-4">
         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Invite Link</h3>
         <div className="flex gap-2">
            <input 
              readOnly 
              value={referralLink} 
              className="flex-1 bg-primary/50 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-gray-400 outline-none truncate"
            />
            <button onClick={() => copyToClipboard(referralLink)} className="bg-accent text-primary px-4 rounded-xl font-black text-xs uppercase">Copy Link</button>
         </div>
      </div>

      <div className="space-y-3">
         <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">How it works</h3>
         <div className="space-y-2">
           {[
             { step: '01', text: 'Share your code or link with friends.' },
             { step: '02', text: 'They signup using your referral.' },
             { step: '03', text: 'You earn commission instantly on every bet they make!' }
           ].map(item => (
             <div key={item.step} className="bg-secondary/40 p-4 rounded-2xl flex items-center gap-4 border border-white/5">
                <span className="text-xl font-black text-accent/30 italic">{item.step}</span>
                <p className="text-xs font-bold text-gray-300">{item.text}</p>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};
