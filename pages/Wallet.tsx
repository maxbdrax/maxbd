
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Wallet: React.FC = () => {
  const { requestDeposit, requestWithdraw, transactions, currentUser, adminSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [amount, setAmount] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!currentUser) return null;

  const turnoverIncomplete = currentUser.currentTurnover < currentUser.requiredTurnover;
  const remainingTurnover = Math.max(0, currentUser.requiredTurnover - currentUser.currentTurnover);

  const validateInput = () => {
    const val = parseFloat(amount);
    const min = activeTab === 'DEPOSIT' ? adminSettings.minDeposit : adminSettings.minWithdraw;
    
    if (isNaN(val) || val < min) {
      alert(`Minimum ${activeTab === 'DEPOSIT' ? 'deposit' : 'withdraw'} is ৳${min}`);
      return false;
    }

    if (activeTab === 'DEPOSIT') {
      if (!txId) {
        alert("Please enter Transaction ID");
        return false;
      }
    } else {
      if (turnoverIncomplete) {
        alert(`Turn-offer incomplete! Please play games of ৳${remainingTurnover.toFixed(2)} more.`);
        return false;
      }
      if (!accountNumber) {
        alert("Please enter your account number");
        return false;
      }
    }
    return true;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    if (activeTab === 'DEPOSIT') {
      setShowConfirmModal(true);
    } else {
      processWithdraw();
    }
  };

  const processDeposit = () => {
    const val = parseFloat(amount);
    requestDeposit(method, val, txId);
    setTxId('');
    setAmount('');
    setShowConfirmModal(false);
    alert("Deposit request submitted for approval!");
  };

  const processWithdraw = () => {
    const val = parseFloat(amount);
    requestWithdraw(method, val, accountNumber);
    setAccountNumber('');
    setAmount('');
    alert("Withdrawal request submitted for approval!");
  };

  const getAdminNumber = () => {
    if (method === 'bKash') return adminSettings.bkashNumber;
    if (method === 'Nagad') return adminSettings.nagadNumber;
    return adminSettings.rocketNumber;
  };

  const myTransactions = transactions.filter(tx => tx.userId === currentUser?.id);

  return (
    <div className="pt-20 pb-24 px-4 max-w-lg mx-auto">
      {activeTab === 'WITHDRAW' && turnoverIncomplete && (
        <div className="mb-4 bg-red-900/30 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3">
           <i className="fa-solid fa-lock text-red-500 text-xl animate-bounce"></i>
           <div>
              <p className="text-xs font-black text-red-500 uppercase italic">Turn-offer Restricted</p>
              <p className="text-[10px] text-white font-bold">You must bet ৳{remainingTurnover.toFixed(2)} more to unlock withdrawals.</p>
           </div>
        </div>
      )}

      <div className="bg-secondary rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('DEPOSIT')}
            className={`flex-1 py-4 font-black text-sm transition ${activeTab === 'DEPOSIT' ? 'bg-accent text-primary' : 'bg-transparent text-gray-400'}`}
          >
            DEPOSIT
          </button>
          <button 
            onClick={() => setActiveTab('WITHDRAW')}
            className={`flex-1 py-4 font-black text-sm transition ${activeTab === 'WITHDRAW' ? 'bg-accent text-primary' : 'bg-transparent text-gray-400'}`}
          >
            WITHDRAW
          </button>
        </div>

        <form onSubmit={handleInitialSubmit} className="p-6 space-y-6">
          {activeTab === 'DEPOSIT' && adminSettings.depositBonusPercent > 0 && (
             <div className="bg-green-600/10 border border-green-500/20 p-3 rounded-xl flex items-center justify-center gap-2">
                <i className="fa-solid fa-sparkles text-green-500"></i>
                <span className="text-[10px] font-black text-green-400 uppercase">Deposit Bonus Active: +{adminSettings.depositBonusPercent}%</span>
             </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Payment Channel</label>
            <div className="grid grid-cols-3 gap-2">
              {['bKash', 'Nagad', 'Rocket'].map(id => (
                <button 
                  key={id}
                  type="button" 
                  onClick={() => setMethod(id as any)}
                  className={`border-2 p-3 rounded-xl flex flex-col items-center gap-1 transition ${method === id ? 'border-accent bg-primary/50' : 'border-white/5 opacity-50'}`}
                >
                  <span className="text-xs font-black uppercase">{id}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'DEPOSIT' && (
            <div className="bg-primary/50 border border-accent/20 p-4 rounded-xl space-y-2">
              <p className="text-[10px] font-black text-gray-500 uppercase">Send Money To:</p>
              <div className="flex justify-between items-center">
                <p className="text-xl font-black text-accent tracking-widest">{getAdminNumber()}</p>
                <button type="button" onClick={() => navigator.clipboard.writeText(getAdminNumber())} className="text-[10px] font-bold text-white bg-white/10 px-2 py-1 rounded">COPY</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Amount (৳)</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-primary/80 border border-white/10 rounded-xl px-4 py-4 text-2xl font-black text-accent outline-none"
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold italic">৳</div>
            </div>
          </div>

          {activeTab === 'DEPOSIT' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">Transaction ID</label>
              <input 
                type="text" 
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="w-full bg-primary border border-white/5 rounded-xl px-4 py-4 text-sm font-bold placeholder-gray-600 outline-none uppercase"
                placeholder="Enter TxID"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">{method} Number</label>
              <input 
                type="text" 
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-primary border border-white/5 rounded-xl px-4 py-4 text-sm font-bold outline-none"
                placeholder={`Your ${method} Number`}
              />
            </div>
          )}

          <button 
            disabled={activeTab === 'WITHDRAW' && turnoverIncomplete}
            className={`w-full bg-gradient-gold text-primary font-black py-4 rounded-xl shadow-lg transition uppercase tracking-widest disabled:opacity-30 disabled:grayscale`}
          >
            Submit {activeTab}
          </button>
        </form>
      </div>

      {/* Confirmation Modal Logic... (Omitted for brevity as it remains same as previous version but includes logic) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-secondary w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Verify Deposit</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Check your payment info</p>
            </div>
            <div className="bg-primary/50 rounded-2xl p-4 space-y-3 border border-white/5">
              <div className="flex justify-between items-center"><span className="text-[9px] font-black text-gray-500">METHOD</span><span className="text-xs font-black text-white">{method}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-black text-gray-500">AMOUNT</span><span className="text-sm font-black text-accent">৳{amount}</span></div>
              <div className="flex justify-between items-center"><span className="text-[9px] font-black text-gray-500">TXID</span><span className="text-xs font-black text-white">{txId}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 bg-white/5 py-4 rounded-2xl font-black text-[10px] uppercase">Back</button>
              <button onClick={processDeposit} className="flex-1 bg-accent text-primary py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-black text-gray-400 uppercase mb-4 px-2 tracking-widest">Recent Activity</h3>
        <div className="space-y-3">
          {myTransactions.map(tx => (
            <div key={tx.id} className="bg-secondary p-4 rounded-xl flex items-center justify-between border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   <i className={`fa-solid ${tx.type === 'DEPOSIT' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs`}></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase">{tx.type} ({tx.method})</p>
                  <p className="text-[8px] text-gray-500">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-accent">৳{tx.amount}</p>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${tx.status === 'APPROVED' ? 'bg-green-600' : tx.status === 'REJECTED' ? 'bg-red-600' : 'bg-gray-700'}`}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
