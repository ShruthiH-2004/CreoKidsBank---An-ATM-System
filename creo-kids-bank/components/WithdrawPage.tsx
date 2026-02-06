"use client";

import { useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { ArrowLeft, Banknote } from 'lucide-react';

interface WithdrawPageProps {
    onBack: () => void;
}

export default function WithdrawPage({ onBack }: WithdrawPageProps) {
    const { withdrawManual } = useBankStore();
    const [customerId, setCustomerId] = useState("");
    const [atmId, setAtmId] = useState("1");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const numCustomerId = parseInt(customerId);
        const numAtmId = parseInt(atmId);
        const numAmount = parseInt(amount);

        if (!numCustomerId || numCustomerId <= 0) {
            setError("Please enter a valid Customer ID");
            return;
        }

        if (!numAmount || numAmount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (numAmount > 10) {
            setError("Max 10 CKB per transaction");
            return;
        }

        const success = await withdrawManual(numCustomerId, numAtmId, numAmount);
        if (success) {
            setAmount("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8">
            <div className="max-w-md mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Banknote className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold">Withdraw Money</h1>
                        <p className="text-gray-500 text-sm mt-1">Enter your details to make a withdrawal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
                            <input
                                type="number"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                placeholder="Enter your Customer ID"
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ATM Location</label>
                            <select
                                value={atmId}
                                onChange={(e) => setAtmId(e.target.value)}
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-green-500 outline-none"
                            >
                                <option value="1">Indiranagar (ID: 1)</option>
                                <option value="2">Malnad (ID: 2)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (CKB)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (max 10)"
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-green-500 outline-none text-center text-xl font-bold"
                                min="1"
                                max="10"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1 text-center">Max 10 CKB per transaction | Max 25 CKB daily</p>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
                        >
                            Withdraw
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
