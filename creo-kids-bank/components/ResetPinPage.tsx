"use client";

import { useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { ArrowLeft, KeyRound } from 'lucide-react';

interface ResetPinPageProps {
    onBack: () => void;
}

export default function ResetPinPage({ onBack }: ResetPinPageProps) {
    const { resetPinManual } = useBankStore();
    const [customerId, setCustomerId] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const numCustomerId = parseInt(customerId);
        if (!numCustomerId || numCustomerId <= 0) {
            setError("Please enter a valid Customer ID");
            return;
        }

        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            setError("PIN must be exactly 4 digits");
            return;
        }

        if (newPin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        const success = await resetPinManual(numCustomerId, newPin);
        if (success) {
            onBack();
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
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <KeyRound className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold">Reset PIN</h1>
                        <p className="text-gray-500 text-sm mt-1">Enter Customer ID and set a new 4-digit PIN</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer ID</label>
                            <input
                                type="number"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                placeholder="Enter your Customer ID"
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 4-digit PIN"
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none text-center text-2xl tracking-widest"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Re-enter PIN</label>
                            <input
                                type="password"
                                maxLength={4}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="Re-enter PIN"
                                className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-purple-500 outline-none text-center text-2xl tracking-widest"
                                required
                            />
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all"
                        >
                            Reset PIN
                        </button>

                        <p className="text-xs text-gray-400 text-center">This will also decrement your daily transaction count</p>
                    </form>
                </div>
            </div>
        </div>
    );
}
