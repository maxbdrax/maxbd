
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminSettings, User, Match } from '../types';

export const AdminPanel: React.FC = () => {
  const { 
    transactions, updateTransactionStatus, users, adminSettings, 
    updateAdminSettings, adminUpdateUser, deleteUser, matches, 
    createMatch, resolveMatch, deleteMatch 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'DEPOSITS' | 'WITHDRAWALS' | 'MATCHES' | 'SETTINGS'>('DASHBOARD');
  const [editingSettings, setEditingSettings] = useState<AdminSettings>(adminSettings);
  
  // User Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBalance, setEditBalance] = useState('');
  const [editBonus, setEditBonus] = useState('');
  const [editRequiredTurnover, setEditRequiredTurnover] = useState('');

  // Match form
  const [mTitle, setMTitle] = useState('');
  const [mT1, setMT1] = useState('');
  const [mT2, setMT2] = useState('');
  const [mO1, setMO1] = useState('1.90');
  const [mO2, setMO2] = useState('1.90');

  const stats = {
    totalUsers: users.length,
    totalBalance: users.reduce((acc, u) => acc + u.balance, 0),
    pendingDeposits: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
    pendingWithdraws: transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').length,
  };

  const handleCreateMatch = async () => {
    if (!mTitle || !mT1 || !mT2) return alert("সব ঘর পূরণ করুন");
    await createMatch(mTitle, mT1, mT2, parseFloat(mO1), parseFloat(mO2));
    setMTitle(''); setMT1(''); setMT2('');
    alert("নতুন ক্রিকেট বাজি যোগ করা হয়েছে!");
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPhone(user.phone || '');
    setEditBalance(user.balance.toString());
    setEditBonus(user.bonusBalance.toString());
    setEditRequiredTurnover(user.requiredTurnover.toString());
  };

  const saveUserEdits = async () => {
    if (!editingUser) return;
    await adminUpdateUser(editingUser.id, {
      username: editUsername,
      phone: editPhone,
      balance: parseFloat(editBalance) || 0,
      bonusBalance: parseFloat(editBonus) || 0,
      requiredTurnover: parseFloat(editRequiredTurnover) || 0
    });
    setEditingUser(null);
    alert("ইউজার তথ্য আপডেট করা হয়েছে!");
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিতভাবে এই ইউজারকে ডিলিট করতে চান?")) {
      await deleteUser(id);
      alert("ইউজার ডিলিট করা হয়েছে।");
    }
  };

  const handleSaveSettings = async () => {
    await updateAdminSettings(editingSettings);
    alert("অ্যাপ সেটিংস সফলভাবে আপডেট করা হয়েছে!");
  };

  return (
    <div className="min-h-screen bg-[#001515] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#012a2a] border-r border-white/5 p-6 space-y-2">
        <h2 className="text-2xl font-black text-accent mb-8 italic tracking-tighter uppercase">Admin Panel</h2>
        {[
          { id: 'DASHBOARD', icon: 'fa-chart-line', label: 'ড্যাশবোর্ড' },
          { id: 'USERS', icon: 'fa-users', label: 'ইউজার লিস্ট' },
          { id: 'DEPOSITS', icon: 'fa-arrow-down', label: 'ডিপোজিট' },
          { id: 'WITHDRAWALS', icon: 'fa-arrow-up', label: 'উইথড্র' },
          { id: 'MATCHES', icon: 'fa-cricket-bat-ball', label: 'ক্রিকেট বাজি' },
          { id: 'SETTINGS', icon: 'fa-gears', label: 'সেটিংস' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === item.id ? 'bg-accent text-primary shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-8 overflow-y-auto pb-24">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'মোট প্লেয়ার', value: stats.totalUsers, icon: 'fa-users', color: 'text-blue-400' },
              { label: 'মোট ব্যালেন্স', value: `৳${stats.totalBalance.toFixed(0)}`, icon: 'fa-vault', color: 'text-accent' },
              { label: 'পেন্ডিং ডিপোজিট', value: stats.pendingDeposits, icon: 'fa-hourglass-start', color: 'text-green-400' },
              { label: 'পেন্ডিং উইথড্র', value: stats.pendingWithdraws, icon: 'fa-hourglass-end', color: 'text-red-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#012a2a] p-6 rounded-2xl border border-white/5 shadow-xl">
                <div className={`text-2xl mb-2 ${stat.color}`}><i className={`fa-solid ${stat.icon}`}></i></div>
                <p className="text-xs font-bold text-gray-500 uppercase">{stat.label}</p>
                <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="bg-[#012a2a] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <div className="p-6 bg-black/20 flex justify-between items-center border-b border-white/5">
              <h3 className="font-black text-accent uppercase italic">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/10 text-[10px] uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Turnover</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-10 h-10 rounded-full border border-accent/20" alt="av" />
                          <div>
                            <p className="text-sm font-bold text-white">{u.username}</p>
                            <p className="text-[10px] text-gray-500">{u.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-accent">৳{u.balance.toFixed(2)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-blue-300">৳{u.currentTurnover.toFixed(0)} / ৳{u.requiredTurnover.toFixed(0)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button onClick={() => handleEditUser(u)} className="bg-accent/10 text-accent px-3 py-1.5 rounded-lg hover:bg-accent hover:text-primary transition font-black text-[10px] uppercase">Edit</button>
                        <button onClick={() => handleDeleteUser(u.id)} className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition font-black text-[10px] uppercase">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'DEPOSITS' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-accent uppercase italic">Pending Deposits</h3>
            <div className="grid grid-cols-1 gap-4">
              {transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').map(tx => (
                <div key={tx.id} className="bg-[#012a2a] p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
                  <div>
                    <p className="font-black text-white">{tx.username} <span className="text-[10px] text-gray-500 uppercase ml-2">({tx.method})</span></p>
                    <p className="text-2xl font-black text-accent">৳{tx.amount}</p>
                    <p className="text-[10px] text-blue-400 font-bold mt-1">TXID: {tx.transactionId}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTransactionStatus(tx.id, 'REJECTED')} className="bg-red-600/20 text-red-500 px-4 py-2 rounded-xl text-xs font-black">REJECT</button>
                    <button onClick={() => updateTransactionStatus(tx.id, 'APPROVED')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">APPROVE</button>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length === 0 && (
                <div className="text-center py-20 opacity-20 italic">কোনো পেন্ডিং ডিপোজিট নেই।</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'WITHDRAWALS' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-red-500 uppercase italic">Pending Withdrawals</h3>
            <div className="grid grid-cols-1 gap-4">
              {transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').map(tx => (
                <div key={tx.id} className="bg-[#012a2a] p-6 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
                  <div>
                    <p className="font-black text-white">{tx.username} <span className="text-[10px] text-gray-500 uppercase ml-2">({tx.method})</span></p>
                    <p className="text-2xl font-black text-red-500">৳{tx.amount}</p>
                    <p className="text-[10px] text-accent font-bold mt-1">A/C: {tx.accountNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTransactionStatus(tx.id, 'REJECTED')} className="bg-red-600/20 text-red-500 px-4 py-2 rounded-xl text-xs font-black">REJECT</button>
                    <button onClick={() => updateTransactionStatus(tx.id, 'APPROVED')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg">APPROVE</button>
                  </div>
                </div>
              ))}
              {transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').length === 0 && (
                <div className="text-center py-20 opacity-20 italic">কোনো পেন্ডিং উইথড্র নেই।</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'MATCHES' && (
          <div className="space-y-8">
            <div className="bg-[#012a2a] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
              <h3 className="text-xl font-black uppercase text-accent italic">নতুন ক্রিকেট ম্যাচ অ্যাড করুন</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Match Title (e.g. IPL: CSK vs MI)" value={mTitle} onChange={e => setMTitle(e.target.value)} className="bg-primary p-4 rounded-xl border border-white/5" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Team A Name" value={mT1} onChange={e => setMT1(e.target.value)} className="bg-primary p-4 rounded-xl border border-white/5" />
                  <input type="text" placeholder="Team B Name" value={mT2} onChange={e => setMT2(e.target.value)} className="bg-primary p-4 rounded-xl border border-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="0.01" placeholder="Team A Odds" value={mO1} onChange={e => setMO1(e.target.value)} className="bg-primary p-4 rounded-xl border border-white/5" />
                  <input type="number" step="0.01" placeholder="Team B Odds" value={mO2} onChange={e => setMO2(e.target.value)} className="bg-primary p-4 rounded-xl border border-white/5" />
                </div>
              </div>
              <button onClick={handleCreateMatch} className="w-full bg-accent text-primary font-black py-4 rounded-xl shadow-lg">ম্যাচ পাবলিশ করুন</button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black uppercase text-accent italic">চলমান ম্যাচ ও ফলাফল</h3>
              {matches.map(m => (
                <div key={m.id} className="bg-[#012a2a] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-accent font-black uppercase">{m.title}</p>
                    <p className="text-xs text-gray-500 font-bold">{m.teamA} (Odds: {m.oddsA}) vs {m.teamB} (Odds: {m.oddsB})</p>
                    <p className={`text-[10px] mt-1 font-black ${m.status === 'RESOLVED' ? 'text-green-500' : 'text-yellow-500'}`}>Status: {m.status}</p>
                  </div>
                  {m.status === 'OPEN' && (
                    <div className="flex gap-2">
                      <button onClick={() => resolveMatch(m.id, m.teamA)} className="bg-green-600 px-4 py-2 rounded-xl text-[10px] font-black">{m.teamA} Winner</button>
                      <button onClick={() => resolveMatch(m.id, m.teamB)} className="bg-green-600 px-4 py-2 rounded-xl text-[10px] font-black">{m.teamB} Winner</button>
                      <button onClick={() => deleteMatch(m.id)} className="bg-red-600 px-4 py-2 rounded-xl text-[10px] font-black">Delete</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="bg-[#012a2a] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
              <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
                <h3 className="text-xl font-black uppercase text-accent italic">অ্যাপ পেমেন্ট সেটিংস</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">বিকাশ নম্বর</label>
                  <input 
                    type="text" 
                    value={editingSettings.bkashNumber} 
                    onChange={e => setEditingSettings({...editingSettings, bkashNumber: e.target.value})} 
                    className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-accent" 
                    placeholder="bKash Number" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">নগদ নম্বর</label>
                  <input 
                    type="text" 
                    value={editingSettings.nagadNumber} 
                    onChange={e => setEditingSettings({...editingSettings, nagadNumber: e.target.value})} 
                    className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-accent" 
                    placeholder="Nagad Number" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">রকেট নম্বর</label>
                  <input 
                    type="text" 
                    value={editingSettings.rocketNumber} 
                    onChange={e => setEditingSettings({...editingSettings, rocketNumber: e.target.value})} 
                    className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-accent" 
                    placeholder="Rocket Number" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
                    <h3 className="text-sm font-black uppercase text-blue-400 italic">বোনাস ও কমিশন</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">ডিপোজিট বোনাস (%)</label>
                      <input 
                        type="number" 
                        value={editingSettings.depositBonusPercent} 
                        onChange={e => setEditingSettings({...editingSettings, depositBonusPercent: parseInt(e.target.value) || 0})} 
                        className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-blue-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">রেফার কমিশন (%)</label>
                      <input 
                        type="number" 
                        value={editingSettings.referralCommission} 
                        onChange={e => setEditingSettings({...editingSettings, referralCommission: parseInt(e.target.value) || 0})} 
                        className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-blue-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">গ্লোবাল ক্লেইম বোনাস (৳)</label>
                      <input 
                        type="number" 
                        value={editingSettings.globalClaimBonus} 
                        onChange={e => setEditingSettings({...editingSettings, globalClaimBonus: parseInt(e.target.value) || 0})} 
                        className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-yellow-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-l-4 border-red-500 pl-4">
                    <h3 className="text-sm font-black uppercase text-red-400 italic">ট্রানজেকশন লিমিট</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">মিনিমাম ডিপোজিট (৳)</label>
                      <input 
                        type="number" 
                        value={editingSettings.minDeposit} 
                        onChange={e => setEditingSettings({...editingSettings, minDeposit: parseInt(e.target.value) || 0})} 
                        className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-red-400" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1">মিনিমাম উইথড্র (৳)</label>
                      <input 
                        type="number" 
                        value={editingSettings.minWithdraw} 
                        onChange={e => setEditingSettings({...editingSettings, minWithdraw: parseInt(e.target.value) || 0})} 
                        className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-red-400" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveSettings} 
                className="w-full bg-gradient-gold text-primary font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Save All Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-secondary w-full max-w-lg rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-accent uppercase italic">ইউজার তথ্য পরিবর্তন</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">প্লেয়ার ইউজারনেম</label>
                <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">ফোন নম্বর</label>
                <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-bold" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">ব্যালেন্স (৳)</label>
                <input type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-accent text-lg" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-red-500 uppercase ml-1">বোনাস ব্যালেন্স (৳)</label>
                <input type="number" value={editBonus} onChange={e => setEditBonus(e.target.value)} className="w-full bg-red-900/10 p-4 rounded-2xl border border-red-500/20 font-black text-red-500" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-blue-500 uppercase ml-1">টার্নওভার রিকয়ার্ড (৳)</label>
                <input type="number" value={editRequiredTurnover} onChange={e => setEditRequiredTurnover(e.target.value)} className="w-full bg-primary p-4 rounded-2xl border border-white/5 font-black text-blue-400" />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button onClick={() => setEditingUser(null)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black text-xs uppercase hover:bg-white/10 transition">Cancel</button>
              <button onClick={saveUserEdits} className="flex-1 bg-accent text-primary py-4 rounded-2xl font-black text-xs uppercase shadow-lg hover:bg-yellow-400 transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
