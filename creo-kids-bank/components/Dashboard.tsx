"use client";

import { useEffect, useState } from 'react';
import { useBankStore } from '../store/useBankStore';
// Icons
import { CreditCard, Landmark, RefreshCcw, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
    const { customers, atms, selectedCustomerId, selectedAtmId, fetchData, selectCustomer, selectATM, withdraw, resetPin } = useBankStore();
    const [amount, setAmount] = useState<number>(0);

    useEffect(() => {
        fetchData();
    }, []);

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const selectedATM = atms.find(a => a.id === selectedAtmId);

    const handleWithdraw = () => {
        if (amount > 0) {
            withdraw(amount);
            setAmount(0); // Reset input
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">Creo Kids Bank</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">Manage your CKB wisely!</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ATM Selection */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Landmark className="w-6 h-6" /> Select ATM
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {atms.map(atm => (
                            <div
                                key={atm.id}
                                onClick={() => selectATM(atm.id)}
                                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${selectedAtmId === atm.id
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:border-blue-300 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-xl">{atm.location}</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${atm.current_cash < 20 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                        }`}>
                                        {atm.current_cash} CKB
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Customer Selection */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <CreditCard className="w-6 h-6" /> Select Card
                    </h2>
                    <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                        {customers.map(customer => (
                            <div
                                key={customer.id}
                                onClick={() => selectCustomer(customer.id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedCustomerId === customer.id
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 hover:border-purple-300 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-lg">{customer.name}</div>
                                        <div className="text-sm text-gray-500 uppercase tracking-widest">{customer.card_name}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${customer.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            customer.status === 'Disabled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {customer.status === 'Active' ? `${customer.balance} CKB` : customer.status}
                                        </span>
                                        {customer.status !== 'Active' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); resetPin(customer.id); }}
                                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                <RefreshCcw className="w-3 h-3" /> Reset PIN
                                            </button>
                                        )}
                                        {/* Debug Reset for everyone for testing */}
                                        {customer.status === 'Active' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); resetPin(customer.id); }}
                                                className="text-xs text-xs text-gray-400 hover:text-blue-500"
                                                title="Reset daily limits"
                                            >
                                                Reset Limits
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Transaction Area */}
            <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                <h2 className="text-2xl font-bold mb-6 border-b pb-2">Withdrawal System</h2>

                {!selectedCustomer || !selectedATM ? (
                    <div className="text-center py-10 text-gray-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Please insert your card (Select User) and choose an ATM.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <div className='flex items-center gap-4'>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                                    {selectedCustomer.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Withdrawing from</p>
                                    <p className="font-bold">{selectedATM.location}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Current Balance</p>
                                <p className="font-bold text-2xl text-green-600">{selectedCustomer.balance} CKB</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 5, 10].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className={`py-4 rounded-xl font-bold text-xl transition-all ${amount === val
                                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                                        }`}
                                >
                                    {val} CKB
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="flex-1 p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 text-xl font-bold text-center bg-transparent"
                                placeholder="Enter Amount"
                                min="1"
                                max="10"
                            />
                            <button
                                onClick={handleWithdraw}
                                disabled={amount <= 0 || amount > 10}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                            >
                                WITHDRAW
                            </button>
                        </div>
                        <p className="text-center text-xs text-gray-400">Max 10 CKB per transaction. Max 25 CKB daily.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
