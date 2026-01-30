
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSettings, User, Transaction } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    transactions, updateTransactionStatus, users, adminSettings, 
    updateAdminSettings, adminUpdateUser, deleteUser, matches, 
    createMatch, resolveMatch, deleteMatch, sendBroadcast, globalNotifications, deleteBroadcast
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'DEPOSITS' | 'WITHDRAWALS' | 'BROADCAST' | 'SETTINGS'>('DASHBOARD');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'INFO' | 'ALERT' | 'PROMO'>('INFO');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editBalance, setEditBalance] = useState('');

  const stats = {
    totalUsers: users.length,
    pendingDeposits: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
    pendingWithdraws: transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').length,
    totalBalance: users.reduce((acc, u) => acc + (u.balance || 0), 0)
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg) return;
    await sendBroadcast(broadcastMsg, broadcastType);
    setBroadcastMsg('');
    alert("Broadcast sent successfully!");
  };

  const handleUpdateBalance = async () => {
    if (!editingUser || !editBalance) return;
    await adminUpdateUser(editingUser.id, { balance: parseFloat(editBalance) });
    setEditingUser(null);
    setEditBalance('');
    alert("User balance updated!");
  };

  return (
    <div className="min-h-screen bg-[#001515] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-[#012a2a] border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-accent italic tracking-tighter uppercase leading-none">ADMIN HUB</h2>
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Management Suite</p>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'DASHBOARD', icon: 'fa-chart-pie', label: 'Overview' },
            { id: 'USERS', icon: 'fa-user-group', label: 'Manage Users' },
            { id: 'DEPOSITS', icon: 'fa-wallet', label: 'Deposit Requests' },
            { id: 'WITHDRAWALS', icon: 'fa-money-bill-transfer', label: 'Withdraw Requests' },
            { id: 'BROADCAST', icon: 'fa-bullhorn', label: 'Broadcasts' },
            { id: 'SETTINGS', icon: 'fa-sliders', label: 'Global Settings' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all group ${
                activeTab === item.id 
                  ? 'bg-accent text-primary shadow-lg shadow-accent/10' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              <span className="text-[11px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5 opacity-30 text-center">
          <p className="text-[8px] font-bold uppercase">Max999 Engine v2.5</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto pb-32">
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Members', val: stats.totalUsers, color: 'text-blue-400', icon: 'fa-users' },
                { label: 'Pending Deposits', val: stats.pendingDeposits, color: 'text-green-400', icon: 'fa-arrow-down' },
                { label: 'Pending Withdraws', val: stats.pendingWithdraws, color: 'text-red-400', icon: 'fa-arrow-up' },
                { label: 'Total System Liab.', val: `৳${stats.totalBalance.toLocaleString()}`, color: 'text-accent', icon: 'fa-vault' },
              ].map((s, i) => (
                <div key={i} className="bg-secondary p-6 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                  <i className={`fa-solid ${s.icon} absolute -bottom-2 -right-2 text-6xl opacity-5 group-hover:scale-110 transition`}></i>
                  <p className="text-[10px] font-black text-gray-500 uppercase mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-secondary rounded-[2.5rem] p-8 border border-white/5">
               <h3 className="text-sm font-black text-white uppercase italic mb-6">Recent User Activity</h3>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                   <thead>
                     <tr className="text-gray-500 border-b border-white/5">
                        <th className="pb-4 font-black uppercase">Username</th>
                        <th className="pb-4 font-black uppercase">Joined</th>
                        <th className="pb-4 font-black uppercase">Balance</th>
                        <th className="pb-4 font-black uppercase text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.slice(0, 5).map(u => (
                       <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                         <td className="py-4 font-bold">{u.username}</td>
                         <td className="py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                         <td className="py-4 font-black text-accent">৳{u.balance.toFixed(2)}</td>
                         <td className="py-4 text-right">
                            <button onClick={() => {setEditingUser(u); setEditBalance(u.balance.toString());}} className="text-blue-400 hover:underline">Edit</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-white uppercase italic">User Management</h3>
                <div className="bg-secondary px-4 py-2 rounded-xl border border-white/5 text-xs">Total: {users.length}</div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {users.map(u => (
                 <div key={u.id} className="bg-secondary p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                       <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="avatar" />
                       <div>
                          <p className="text-sm font-black text-white">{u.username}</p>
                          <p className="text-[10px] text-accent font-bold">৳{u.balance.toFixed(2)}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                       <button onClick={() => {setEditingUser(u); setEditBalance(u.balance.toString());}} className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs"><i className="fa-solid fa-pen"></i></button>
                       <button onClick={() => {if(confirm("Delete this user?")) deleteUser(u.id)}} className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-xs"><i className="fa-solid fa-trash"></i></button>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {(activeTab === 'DEPOSITS' || activeTab === 'WITHDRAWALS') && (
          <div className="space-y-6">
             <h3 className="text-xl font-black text-white uppercase italic">{activeTab === 'DEPOSITS' ? 'Deposit' : 'Withdraw'} Queue</h3>
             <div className="space-y-4">
                {transactions.filter(t => t.type === (activeTab === 'DEPOSITS' ? 'DEPOSIT' : 'WITHDRAW') && t.status === 'PENDING').map(tx => (
                  <div key={tx.id} className="bg-secondary p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl animate-in slide-in-from-right duration-300">
                    <div className="flex-1 flex gap-4 items-center">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${tx.type === 'DEPOSIT' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>
                          <i className={`fa-solid ${tx.type === 'DEPOSIT' ? 'fa-building-columns' : 'fa-hand-holding-dollar'}`}></i>
                       </div>
                       <div>
                          <p className="text-sm font-black text-white uppercase">{tx.username} <span className="text-gray-600 ml-2 font-bold text-[10px]">{tx.method}</span></p>
                          <p className="text-[10px] text-gray-500 font-bold">{tx.accountNumber || tx.transactionId}</p>
                          <p className="text-lg font-black text-accent mt-1">৳{tx.amount}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => updateTransactionStatus(tx.id, 'REJECTED')} className="px-6 py-2.5 bg-red-600/10 text-red-500 rounded-xl font-black text-[10px] uppercase border border-red-500/20 hover:bg-red-600 hover:text-white transition">Reject</button>
                       <button onClick={() => updateTransactionStatus(tx.id, 'APPROVED')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-green-600/20 hover:scale-105 transition">Approve</button>
                    </div>
                  </div>
                ))}
                {transactions.filter(t => t.type === (activeTab === 'DEPOSITS' ? 'DEPOSIT' : 'WITHDRAW') && t.status === 'PENDING').length === 0 && (
                   <div className="text-center py-20 opacity-30 italic font-bold">No pending requests found.</div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'BROADCAST' && (
           <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="bg-secondary p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
                <h3 className="text-xl font-black text-accent uppercase italic mb-6">Push Broadcast</h3>
                <div className="space-y-4">
                   <textarea 
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter broadcast message here..."
                    className="w-full bg-primary p-5 rounded-2xl border border-white/10 outline-none text-sm min-h-[140px] focus:border-accent transition"
                   />
                   <div className="flex flex-col sm:flex-row gap-4">
                      <select 
                        value={broadcastType}
                        onChange={(e:any) => setBroadcastType(e.target.value)}
                        className="bg-primary px-4 py-3 rounded-xl border border-white/10 text-xs font-black"
                      >
                         <option value="INFO">Information (Blue)</option>
                         <option value="ALERT">Alert (Red)</option>
                         <option value="PROMO">Promotion (Gold)</option>
                      </select>
                      <button onClick={handleBroadcast} className="flex-1 bg-accent text-primary font-black py-4 rounded-xl shadow-lg uppercase text-xs tracking-widest hover:scale-[1.02] transition">Dispatch To All Users</button>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">History (Will show in Promotion Tab)</p>
                {globalNotifications.map(n => (
                  <div key={n.id} className="bg-secondary p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                     <div>
                        <p className="text-xs font-bold text-white">{n.message}</p>
                        <p className="text-[8px] text-gray-500 mt-1 uppercase">{new Date(n.timestamp).toLocaleString()} • {n.type}</p>
                     </div>
                     <button onClick={() => deleteBroadcast(n.id)} className="text-red-500 p-2 opacity-0 group-hover:opacity-100 transition"><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                ))}
             </div>
           </div>
        )}

        {activeTab === 'SETTINGS' && (
           <div className="max-w-xl space-y-8 animate-in fade-in duration-500">
              <div className="bg-secondary p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
                 <h3 className="text-xl font-black text-white uppercase italic mb-8 border-l-4 border-accent pl-4">System Settings</h3>
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase">bKash Merchant</label>
                       <input value={adminSettings.bkashNumber} onChange={(e) => updateAdminSettings({...adminSettings, bkashNumber: e.target.value})} className="w-full bg-primary p-4 rounded-xl border border-white/5 outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase">Nagad Merchant</label>
                       <input value={adminSettings.nagadNumber} onChange={(e) => updateAdminSettings({...adminSettings, nagadNumber: e.target.value})} className="w-full bg-primary p-4 rounded-xl border border-white/5 outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase">Min Deposit (৳)</label>
                          <input type="number" value={adminSettings.minDeposit} onChange={(e) => updateAdminSettings({...adminSettings, minDeposit: parseInt(e.target.value)})} className="w-full bg-primary p-4 rounded-xl border border-white/5 outline-none font-bold text-accent" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-500 uppercase">Min Withdraw (৳)</label>
                          <input type="number" value={adminSettings.minWithdraw} onChange={(e) => updateAdminSettings({...adminSettings, minWithdraw: parseInt(e.target.value)})} className="w-full bg-primary p-4 rounded-xl border border-white/5 outline-none font-bold text-accent" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
           <div className="bg-secondary w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
              <div className="text-center">
                 <h3 className="text-xl font-black text-white uppercase italic">Modify Member</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase mt-1">{editingUser.username}</p>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase block mb-1">Update Balance (৳)</label>
                    <input 
                      type="number" 
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full bg-primary border border-white/10 rounded-xl px-5 py-4 text-2xl font-black text-accent outline-none"
                    />
                 </div>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black text-xs uppercase">Cancel</button>
                 <button onClick={handleUpdateBalance} className="flex-1 bg-accent text-primary py-4 rounded-2xl font-black text-xs uppercase shadow-lg">Save Changes</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
