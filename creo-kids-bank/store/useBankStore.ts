import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

interface Customer {
    id: number;
    name: string;
    card_name: string;
    balance: number;
    status: string;
}

interface ATM {
    id: number;
    location: string;
    current_cash: number;
}

interface BankState {
    customers: Customer[];
    atms: ATM[];

    // Auth State
    isAuthenticated: boolean;
    loggedInCustomer: Customer | null;
    loggedInAtmId: number | null;

    loading: boolean;

    // Actions
    login: (location: string, cardName: string, pin: string) => Promise<boolean>;
    logout: () => void;

    fetchLogs: () => Promise<void>;
    withdraw: (amount: number) => Promise<void>;
    resetPin: (newPin: string) => Promise<boolean>;
}

export const useBankStore = create<BankState>((set, get) => ({
    customers: [],
    atms: [],
    isAuthenticated: false,
    loggedInCustomer: null,
    loggedInAtmId: null,
    loading: false,

    login: async (location, cardName, pin) => {
        set({ loading: true });
        try {
            const response = await axios.post('http://localhost:8000/login', {
                atm_location: location,
                card_name: cardName,
                pin: pin
            });

            if (response.data.status === 'success') {
                set({
                    isAuthenticated: true,
                    loggedInCustomer: response.data.customer,
                    loggedInAtmId: response.data.atm_id,
                    loading: false
                });
                toast.success("Welcome back!", { description: `Logged in as ${response.data.customer.name}` });
                return true;
            }
        } catch (error: any) {
            if (error.response) {
                toast.error("Login Failed", { description: error.response.data.detail });
            } else {
                toast.error("Login Failed", { description: "Server unreachable" });
            }
        }
        set({ loading: false });
        return false;
    },

    logout: () => {
        set({ isAuthenticated: false, loggedInCustomer: null, loggedInAtmId: null });
        toast.info("Logged out");
    },

    fetchLogs: async () => {
        try {
            const res = await axios.get('http://localhost:8000/customers');
            set({ customers: res.data });
        } catch (error) {
            console.error("Failed to fetch logs");
        }
    },

    withdraw: async (amount) => {
        const { loggedInCustomer, loggedInAtmId, isAuthenticated } = get();
        if (!isAuthenticated || !loggedInCustomer || !loggedInAtmId) return;

        try {
            const response = await axios.post('http://localhost:8000/withdraw', {
                customer_id: loggedInCustomer.id,
                atm_id: loggedInAtmId,
                amount: amount
            });

            if (response.data.status === 'success') {
                toast.success(`Withdrew ${amount} CKB`, {
                    description: `New Balance: ${response.data.new_balance} CKB`
                });

                // Update local state immediately
                set({
                    loggedInCustomer: { ...loggedInCustomer, balance: response.data.new_balance }
                });
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                toast.error("Transaction Failed", { description: error.response.data.detail });
            }
        }
    },

    resetPin: async (newPin: string) => {
        const { loggedInCustomer } = get();
        if (!loggedInCustomer) return false;

        try {
            const response = await axios.post('http://localhost:8000/reset-pin', {
                customer_id: loggedInCustomer.id,
                new_pin: newPin
            });

            if (response.data.status === 'success') {
                toast.success("PIN Reset Successful", { description: "Your new PIN is now active." });
                return true;
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                toast.error("Reset Failed", { description: error.response.data.detail });
            } else {
                toast.error("Reset Failed");
            }
        }
        return false;
    }
}));
