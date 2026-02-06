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
    selectedCustomerId: number | null;
    selectedAtmId: number | null;
    loading: boolean;

    fetchData: () => Promise<void>;
    selectCustomer: (id: number) => void;
    selectATM: (id: number) => void;
    withdraw: (amount: number) => Promise<void>;
    resetPin: (customerId: number) => Promise<void>;
}

export const useBankStore = create<BankState>((set, get) => ({
    customers: [],
    atms: [],
    selectedCustomerId: null,
    selectedAtmId: null,
    loading: false,

    fetchData: async () => {
        set({ loading: true });
        try {
            const [customersRes, atmsRes] = await Promise.all([
                axios.get('http://localhost:8000/customers'),
                axios.get('http://localhost:8000/atms')
            ]);
            set({
                customers: customersRes.data,
                atms: atmsRes.data,
                loading: false
            });
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load bank data");
            set({ loading: false });
        }
    },

    selectCustomer: (id) => set({ selectedCustomerId: id }),
    selectATM: (id) => set({ selectedAtmId: id }),

    withdraw: async (amount) => {
        const { selectedCustomerId, selectedAtmId, fetchData } = get();
        if (!selectedCustomerId || !selectedAtmId) {
            toast.error("Please select both a Customer and an ATM");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/withdraw', {
                customer_id: selectedCustomerId,
                atm_id: selectedAtmId,
                amount: amount
            });

            if (response.data.status === 'success') {
                toast.success(`Withdrew ${amount} CKB`, {
                    description: `New Balance: ${response.data.new_balance} CKB`
                });
                // Refresh data to ensure sync
                await fetchData();
            }
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.detail) {
                const detail = error.response.data.detail;
                toast.error("Transaction Failed", { description: detail });
            } else {
                toast.error("Transaction Failed", { description: "Unknown error occurred" });
            }
        }
    },

    resetPin: async (customerId) => {
        try {
            const response = await axios.post('http://localhost:8000/reset-pin', {
                customer_id: customerId
            });
            toast.success("PIN Reset Successful", { description: "Daily limit count decremented." });
        } catch (error) {
            toast.error("Reset Failed");
        }
    }
}));
