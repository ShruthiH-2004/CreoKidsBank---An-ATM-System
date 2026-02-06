"use client";

import { useEffect, useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { LogOut, History, RefreshCcw, Banknote } from 'lucide-react';
import ResetPinPage from './ResetPinPage';

export default function Dashboard() {
    const { loggedInCustomer, loggedInAtmId, withdraw, logout, fetchLogs, customers } = useBankStore();
    const [amount, setAmount] = useState<string>("");
    const [viewLogs, setViewLogs] = useState(false);
    const [showResetPin, setShowResetPin] = useState(false);

    const handleWithdraw = () => {
        const numAmount = parseInt(amount);
        if (numAmount > 0) {
            withdraw(numAmount);
            setAmount("");
        }
    };

    const handleFetchLogs = async () => {
        await fetchLogs();
        setViewLogs(!viewLogs);
    };

    if (!loggedInCustomer) return null;

    // Show Reset PIN Page
    if (showResetPin) {
        return <ResetPinPage onBack={() => setShowResetPin(false)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {loggedInCustomer.name}</h1>
                        <p className="text-gray-500 text-sm">
                            Customer ID: <span className="font-mono font-bold">{loggedInCustomer.id}</span> |
                            Card: <span className="font-mono">{loggedInCustomer.card_name}</span> |
                            ATM ID: {loggedInAtmId}
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">{loggedInCustomer.balance} CKB</div>
                        <button onClick={logout} className="text-red-500 text-sm hover:underline flex items-center justify-end gap-1 w-full mt-2">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    </div>
                </header>

                {/* Main Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Withdraw Section */}
                    <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-green-500" /> Withdraw Money
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2">
                                {[1, 2, 5, 10].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val.toString())}
                                        className={`py-2 rounded-lg font-bold border transition-all ${amount === val.toString()
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-200 hover:border-blue-400 dark:border-zinc-700'
                                            }`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="flex-1 p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 font-bold text-center text-xl"
                                    placeholder="Enter amount manually"
                                    min="1"
                                    max="10"
                                />
                                <button
                                    onClick={handleWithdraw}
                                    disabled={!amount || parseInt(amount) <= 0}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 rounded-lg disabled:opacity-50"
                                >
                                    Withdraw
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 text-center">Max 10 CKB per transaction | Max 25 CKB daily</p>
                        </div>
                    </div>

                    {/* Side Actions */}
                    <div className="space-y-6">
                        {/* Reset PIN */}
                        <button
                            onClick={() => setShowResetPin(true)}
                            className="w-full bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-purple-400 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <RefreshCcw className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg">Reset PIN</span>
                            </div>
                            <p className="text-xs text-gray-500">Change your 4-digit PIN.</p>
                        </button>

                        {/* Logs Toggle */}
                        <button
                            onClick={handleFetchLogs}
                            className="w-full bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-orange-400 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <History className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-lg">View Logs</span>
                            </div>
                            <p className="text-xs text-gray-500">Check all customer balances.</p>
                        </button>
                    </div>
                </div>

                {/* Logs Section */}
                {viewLogs && (
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold text-lg mb-4">System Logs (All Customers)</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">ID</th>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Card Name</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 rounded-tr-lg text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((c) => (
                                        <tr key={c.id} className="border-b dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                            <td className="p-3 font-mono">{c.id}</td>
                                            <td className="p-3 font-semibold">{c.name}</td>
                                            <td className="p-3 font-mono text-xs">{c.card_name}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        c.status === 'DISABLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-bold">{c.balance} CKB</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
