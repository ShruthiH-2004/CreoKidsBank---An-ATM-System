"use client";

import { useEffect, useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { LogOut, History, RefreshCcw, Banknote } from 'lucide-react';
import ResetPinPage from './ResetPinPage';
import WithdrawPage from './WithdrawPage';
import Image from 'next/image';

export default function Dashboard() {
    const { loggedInCustomer, loggedInAtmId, logout, fetchLogs, fetchAtmLogs, customers, atmLogs, userType, loggedInAtmData } = useBankStore();
    const [viewLogs, setViewLogs] = useState(false);
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'withdraw' | 'resetpin'>('dashboard');

    const handleFetchLogs = async () => {
        if (userType === 'atm') {
            await fetchAtmLogs();
        } else {
            await fetchLogs();
        }
        setViewLogs(!viewLogs);
    };

    if (!userType) return null;

    // Show Withdraw Page (Only for Customers)
    if (currentPage === 'withdraw' && userType === 'customer') {
        return <WithdrawPage onBack={() => setCurrentPage('dashboard')} />;
    }

    // Show Reset PIN Page
    if (currentPage === 'resetpin') {
        return <ResetPinPage onBack={() => setCurrentPage('dashboard')} />;
    }

    // ATM ADMIN DASHBOARD
    if (userType === 'atm' && loggedInAtmData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <header className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 border-l-4 border-l-purple-600">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ATM Admin Dashboard</h1>
                                <p className="text-gray-500 text-sm mt-1">
                                    Location: <span className="font-bold">{loggedInAtmData.location}</span> |
                                    ID: <span className="font-mono font-bold">{loggedInAtmData.id}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-sm text-gray-500">Current Cash</span>
                                <div className="text-4xl font-bold text-green-600">{loggedInAtmData.current_cash} CKB</div>
                            </div>
                        </div>
                        <button onClick={logout} className="text-red-500 text-sm hover:underline flex items-center gap-1 mt-4">
                            <LogOut className="w-3 h-3" /> Logout
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={handleFetchLogs}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-blue-400 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <History className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-xl">View Transaction Logs</span>
                            </div>
                            <p className="text-sm text-gray-500">View detailed withdrawal history for this ATM.</p>
                        </button>

                        <button
                            onClick={() => setCurrentPage('resetpin')}
                            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-pink-400 transition-all text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-pink-100 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                    <RefreshCcw className="w-6 h-6" />
                                </div>
                                <span className="font-bold text-xl">Reset PIN</span>
                            </div>
                            <p className="text-sm text-gray-500">Update Customer PINs or Admin PIN.</p>
                        </button>
                    </div>

                    {viewLogs && (
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-lg mb-4">ATM Transaction Logs</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-zinc-800 text-gray-500">
                                        <tr>
                                            <th className="p-3 rounded-tl-lg">Date</th>
                                            <th className="p-3">Customer ID</th>
                                            <th className="p-3 text-right">Withdrawn</th>
                                            <th className="p-3 text-right">Cust. Balance</th>
                                            <th className="p-3 rounded-tr-lg text-right">ATM Cash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {atmLogs.map((log) => (
                                            <tr key={log.id} className="border-b dark:border-zinc-800 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                                <td className="p-3 font-mono font-bold text-blue-600">{log.customer_id}</td>
                                                <td className="p-3 text-right font-bold text-red-500">-{log.amount_withdrawn}</td>
                                                <td className="p-3 text-right">{log.customer_total_balance}</td>
                                                <td className="p-3 text-right font-mono">{log.atm_current_cash}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // CUSTOMER DASHBOARD
    if (!loggedInCustomer) return null; // Safety check

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header with Image */}
                <header className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        {/* Left: User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome, {loggedInCustomer.name}</h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Customer ID: <span className="font-mono font-bold text-blue-600">{loggedInCustomer.id}</span> |
                                Card: <span className="font-mono">{loggedInCustomer.card_name}</span> |
                                ATM ID: <span className="font-mono font-bold">{loggedInAtmId}</span>
                            </p>
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">Current Balance</span>
                                <div className="text-4xl font-bold text-blue-600">{loggedInCustomer.balance} CKB</div>
                            </div>
                            <button onClick={logout} className="text-red-500 text-sm hover:underline flex items-center gap-1 mt-4 mx-auto md:mx-0">
                                <LogOut className="w-3 h-3" /> Logout
                            </button>
                        </div>

                        {/* Right: Image */}
                        <div className="flex-shrink-0">
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-blue-100 shadow-lg">
                                <Image
                                    src="/Kid_Image.png"
                                    alt="Creo Kids Bank"
                                    width={192}
                                    height={192}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Withdraw Button */}
                    <button
                        onClick={() => setCurrentPage('withdraw')}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-green-400 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <Banknote className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl">Withdraw</span>
                        </div>
                        <p className="text-sm text-gray-500">Enter Customer ID, ATM ID, and Amount to withdraw money.</p>
                    </button>

                    {/* Reset PIN Button */}
                    <button
                        onClick={() => setCurrentPage('resetpin')}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-purple-400 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <RefreshCcw className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl">Reset PIN</span>
                        </div>
                        <p className="text-sm text-gray-500">Enter Customer ID and set a new 4-digit PIN.</p>
                    </button>

                    {/* Logs Button */}
                    <button
                        onClick={handleFetchLogs}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:border-orange-400 transition-all text-left group"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <History className="w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl">View Logs</span>
                        </div>
                        <p className="text-sm text-gray-500">Fetch all customer balances.</p>
                    </button>
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
                                            <td className="p-3 font-mono font-bold">{c.id}</td>
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
