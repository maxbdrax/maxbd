
import React from 'react';
import { useApp } from '../context/AppContext';

export const Promotion: React.FC = () => {
  const { globalNotifications } = useApp();

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-accent italic uppercase tracking-tighter leading-none">Promotions</h2>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Official Offers & Updates</p>
      </div>

      <div className="space-y-4">
        {globalNotifications.length === 0 ? (
          <div className="bg-secondary/30 rounded-3xl p-12 text-center border border-white/5 opacity-40">
            <i className="fa-solid fa-gift text-5xl mb-4"></i>
            <p className="font-bold text-sm uppercase">No active promotions right now</p>
          </div>
        ) : (
          globalNotifications.map((note) => (
            <div 
              key={note.id} 
              className={`relative overflow-hidden bg-secondary rounded-[2rem] p-6 border border-white/10 shadow-xl transition hover:border-accent/30 group`}
            >
              {/* Status Indicator */}
              <div className="absolute top-0 right-0">
                <div className={`px-4 py-1 text-[8px] font-black uppercase italic rounded-bl-xl ${
                  note.type === 'ALERT' ? 'bg-red-600' : note.type === 'PROMO' ? 'bg-accent text-primary' : 'bg-blue-600'
                }`}>
                  {note.type}
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  note.type === 'ALERT' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'
                }`}>
                  <i className={`fa-solid ${note.type === 'ALERT' ? 'fa-triangle-exclamation' : 'fa-bullhorn'}`}></i>
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2 leading-snug">
                    {note.message}
                  </h3>
                  <p className="text-[9px] text-gray-500 font-bold">
                    <i className="fa-regular fa-clock mr-1"></i>
                    {new Date(note.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="absolute -bottom-2 -right-2 opacity-5 rotate-12 group-hover:scale-125 transition duration-500">
                <i className="fa-solid fa-gem text-7xl"></i>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Static Bonus Info */}
      <div className="bg-gradient-to-br from-[#015252] to-primary p-6 rounded-3xl border border-accent/20">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-black italic shadow-lg">10%</div>
            <div>
               <p className="text-xs font-black text-white uppercase">Daily Deposit Bonus</p>
               <p className="text-[10px] text-accent font-bold">Get 10% extra on every deposit you make!</p>
            </div>
         </div>
      </div>
    </div>
  );
};
