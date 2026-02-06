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
    userType: 'customer' | 'atm' | null;
    loggedInCustomer: Customer | null;
    loggedInAtmId: number | null;
    loggedInAtmData: ATM | null;

    atmLogs: any[];

    loading: boolean;

    // Actions
    login: (location: string, cardName: string, pin: string) => Promise<boolean>;
    logout: () => void;

    fetchLogs: () => Promise<void>;
    fetchAtmLogs: () => Promise<void>;
    withdrawManual: (customerId: number, atmId: number, amount: number) => Promise<boolean>;
    resetPinManual: (customerId: number, newPin: string) => Promise<boolean>;
    resetAtmPin: (atmId: number, newPin: string) => Promise<boolean>;
}

export const useBankStore = create<BankState>((set, get) => ({
    customers: [],
    atms: [],
    isAuthenticated: false,
    userType: null,
    loggedInCustomer: null,
    loggedInAtmId: null,
    loggedInAtmData: null,
    atmLogs: [],
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
                const userType = response.data.user_type; // 'customer' or 'atm'

                if (userType === 'atm') {
                    set({
                        isAuthenticated: true,
                        userType: 'atm',
                        loggedInAtmId: response.data.atm_id,
                        loggedInAtmData: response.data.atm_data,
                        loggedInCustomer: null,
                        loading: false
                    });
                    toast.success("Welcome Admin!", { description: response.data.message });
                } else {
                    set({
                        isAuthenticated: true,
                        userType: 'customer',
                        loggedInCustomer: response.data.customer,
                        loggedInAtmId: response.data.atm_id,
                        loggedInAtmData: response.data.atm,
                        loading: false
                    });
                    toast.success("Welcome!", { description: `Logged in as ${response.data.customer.name}` });
                }
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
        set({
            isAuthenticated: false,
            userType: null,
            loggedInCustomer: null,
            loggedInAtmId: null,
            loggedInAtmData: null,
            atmLogs: []
        });
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

    fetchAtmLogs: async () => {
        const { loggedInAtmId } = get();
        if (!loggedInAtmId) return;
        try {
            const res = await axios.get(`http://localhost:8000/atm/logs/${loggedInAtmId}`);
            set({ atmLogs: res.data });
        } catch (error) {
            console.error("Failed to fetch ATM logs");
        }
    },

    withdrawManual: async (customerId: number, atmId: number, amount: number) => {
        try {
            const response = await axios.post('http://localhost:8000/withdraw', {
                customer_id: customerId,
                atm_id: atmId,
                amount: amount
            });

            if (response.data.status === 'success') {
                toast.success(`Withdrew ${amount} CKB`, {
                    description: `New Balance: ${response.data.new_balance} CKB`
                });

                // Update logged in customer balance if it's the same user
                const { loggedInCustomer } = get();
                if (loggedInCustomer && loggedInCustomer.id === customerId) {
                    set({
                        loggedInCustomer: { ...loggedInCustomer, balance: response.data.new_balance }
                    });
                }
                return true;
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                toast.error("Transaction Failed", { description: error.response.data.detail });
            } else {
                toast.error("Transaction Failed", { description: "Unknown error" });
            }
        }
        return false;
    },

    resetPinManual: async (customerId: number, newPin: string) => {
        try {
            const response = await axios.post('http://localhost:8000/reset-pin', {
                customer_id: customerId,
                new_pin: newPin
            });

            if (response.data.status === 'success') {
                toast.success("PIN Reset Successful", { description: response.data.message });
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
    },

    resetAtmPin: async (atmId: number, newPin: string) => {
        try {
            const response = await axios.post('http://localhost:8000/atm/reset-pin', {
                atm_id: atmId,
                new_pin: newPin
            });
            if (response.data.status === 'success') {
                toast.success("ATM PIN Updated");
                return true;
            }
        } catch (error: any) {
            toast.error("Update Failed");
        }
        return false;
    }
}));
