"use client";

import { useState } from 'react';
import { useBankStore } from '../store/useBankStore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { login, loading } = useBankStore();
    const router = useRouter(); // Though with single page logic inside Dashboard we might not need this, but user asked for "Home page/login page". I'll keep it conditional render in Dashboard or separate.

    // Actually, user said: "If all 3 details are correct then the user should be automatically headed to the dashboard."
    // I will implement conditional rendering in the main Page wrapper.

    const [location, setLocation] = useState("Indiranagar");
    const [cardName, setCardName] = useState("");
    const [pin, setPin] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(location, cardName, pin);
        // State updates handle the redirect view in parent
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black p-4">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 border border-gray-200 dark:border-zinc-800">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Creo Kids Bank</h1>
                    <p className="text-gray-500">Welcome! Please identify yourself.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ATM Location</label>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="Indiranagar">Indiranagar</option>
                            <option value="Malnad">Malnad</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Name</label>
                        <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            //placeholder="e.g. tom, jerry"
                            className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="****"
                            className="w-full p-3 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Enter ATM"}
                    </button>
                    {!loading && <p className="text-center text-xs text-gray-400 mt-2"></p>}
                </form>
            </div>
        </div>
    );
}
