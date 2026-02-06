"use client";

import Dashboard from '../components/Dashboard';
import LoginPage from '../components/LoginPage';
import { useBankStore } from '../store/useBankStore';

export default function Home() {
  const { isAuthenticated } = useBankStore();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
      {isAuthenticated ? <Dashboard /> : <LoginPage />}
    </main>
  );
}
