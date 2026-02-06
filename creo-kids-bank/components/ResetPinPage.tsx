"use client";

import { useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { ArrowLeft, KeyRound } from 'lucide-react';

interface ResetPinPageProps {
    onBack: () => void;
}

export default function ResetPinPage({ onBack }: ResetPinPageProps) {
    const { loggedInCustomer, resetPin } = useBankStore();
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
            setError("PIN must be exactly 4 digits");
            return;
        }

        if (newPin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        const success = await resetPin(newPin);
        if (success) {
            onBack();
        }
    };

    if (!loggedInCustomer) return null;

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
                        <p className="text-gray-500 text-sm mt-1">Set a new 4-digit PIN for your account</p>
                    </div>

                    {/* Customer Info Display */}
                    <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Customer ID</span>
                                <p className="font-bold text-lg">{loggedInCustomer.id}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Name</span>
                                <p className="font-bold text-lg">{loggedInCustomer.name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Card Name</span>
                                <p className="font-mono">{loggedInCustomer.card_name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Balance</span>
                                <p className="font-bold text-green-600">{loggedInCustomer.balance} CKB</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm PIN</label>
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
                    </form>
                </div>
            </div>
        </div>
    );
}
