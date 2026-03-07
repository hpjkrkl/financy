import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialTransactions } from '../data/initialTransactions';

const KansoContext = createContext();

export function KansoProvider({ children }) {
    // ─── Primitive State ──────────────────────────────
    const [hasOnboarded, setHasOnboarded] = useLocalStorage('kanso_onboarded', false);
    const [transactions, setTransactions] = useLocalStorage('kanso_transactions', initialTransactions);
    const [currentMonth, setCurrentMonth] = useLocalStorage('kanso_current_month', 'all');
    const [isDark, setIsDark] = useLocalStorage('kanso_dark_mode', false);

    // Get current real-time month
    const getCurrentMonthKey = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const currentRealMonth = getCurrentMonthKey();

    // Banks (Your actual bank accounts)
    const [banks, setBanks] = useLocalStorage('kanso_banks', [
        { id: 1, name: 'Maybank', balance: 5000, color: '#8BA888' },
        { id: 2, name: 'CIMB', balance: 3000, color: '#D4A574' }
    ]);

    // Tabungs (Savings buckets within banks)
    const [tabungs, setTabungs] = useState(() => {
        try {
            const saved = localStorage.getItem('kanso_tabungs');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error('Error parsing tabungs from localStorage:', e);
        }
        return [
            { id: 1, name: 'Emergency Fund', bankId: 1, target: 10000, current: 5000, purpose: 'rainy days', color: '#8BA888' },
            { id: 2, name: 'Credit Card Payment', bankId: 1, target: 2000, current: 800, purpose: 'upcoming payment', color: '#D4A574' },
            { id: 3, name: 'Japan Trip', bankId: 2, target: 15000, current: 3000, purpose: 'future plan', color: '#A8B4A5' }
        ];
    });

    // Save tabungs to localStorage whenever they change
    React.useEffect(() => {
        localStorage.setItem('kanso_tabungs', JSON.stringify(tabungs));
    }, [tabungs]);

    // Recurring Expenses (Fixed monthly expenses)
    const [recurringExpenses, setRecurringExpenses] = useLocalStorage('kanso_recurring_expenses', [
        { id: 1, name: 'Rent', amount: 1200, category: 'Housing', dueDate: 1, isActive: true, autoRecord: true },
        { id: 2, name: 'Internet', amount: 100, category: 'Utilities', dueDate: 5, isActive: true, autoRecord: true },
        { id: 3, name: 'Streaming', amount: 15, category: 'Entertainment', dueDate: 15, isActive: true, autoRecord: true }
    ]);

    // Wishlist (Items you're saving for)
    const [wishlist, setWishlist] = useLocalStorage('kanso_wishlist', []);

    // Apply dark class to body
    React.useEffect(() => {
        document.body.classList.toggle('dark', isDark);
    }, [isDark]);

    const toggleDark = () => setIsDark(d => !d);

    // ─── Derived Math State ───────────────────────────
    const filteredTransactions = useMemo(() => {
        if (currentMonth === 'all') return transactions;
        return transactions.filter(t => t.date.startsWith(currentMonth));
    }, [transactions, currentMonth]);

    // Total balance across all banks
    const totalBalance = useMemo(() => {
        return banks.reduce((sum, bank) => sum + bank.balance, 0);
    }, [banks]);

    // Tabungs grouped by bank
    const tabungsByBank = useMemo(() => {
        const grouped = {};
        banks.forEach(bank => {
            grouped[bank.id] = tabungs.filter(t => t.bankId === bank.id);
        });
        return grouped;
    }, [banks, tabungs]);

    // Monthly income from transactions
    const monthlyIncome = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [filteredTransactions]);

    // Total recurring expenses for this month
    const monthlyRecurringTotal = useMemo(() => {
        return recurringExpenses
            .filter(r => r.isActive)
            .reduce((sum, r) => sum + r.amount, 0);
    }, [recurringExpenses]);

    const categoryTotals = useMemo(() => {
        const expenses = filteredTransactions.filter((t) => t.type === 'expense');
        const totals = expenses.reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
        }, {});

        return Object.entries(totals)
            .sort(([, a], [, b]) => b - a)
            .map(([name, total]) => ({ name, total }));
    }, [filteredTransactions]);

    const availableMonths = useMemo(() => {
        const months = new Set();
        transactions.forEach(tx => {
            if (tx.date.length >= 7) {
                const monthStr = tx.date.substring(0, 7);
                if (monthStr.includes('-')) months.add(monthStr);
            }
        });
        return Array.from(months).sort().reverse();
    }, [transactions]);

    // ─── Form State ─────────────────────────────────
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [merchant, setMerchant] = useState('');
    const [category, setCategory] = useState('');
    const [isReflecting, setIsReflecting] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [selectedTabungId, setSelectedTabungId] = useState('');

    // ─── Handlers ───────────────────────────────────
    const handleOnboardingComplete = (onboardingData) => {
        if (onboardingData) {
            const { initialBanks, initialTabungs, initialRecurring } = onboardingData;
            if (initialBanks && initialBanks.length > 0) {
                setBanks(initialBanks);
            }
            if (initialTabungs && initialTabungs.length > 0) {
                setTabungs(initialTabungs);
            }
            if (initialRecurring && initialRecurring.length > 0) {
                setRecurringExpenses(initialRecurring);
            }
        }
        setHasOnboarded(true);
    };

    const handleReflect = () => setIsReflecting(true);
    const handleGoBack = () => setIsReflecting(false);

    const handleConfirm = () => {
        if (!amount || !merchant || !category) return;

        const newTx = {
            id: Date.now(),
            type,
            amount: parseFloat(amount),
            merchant,
            category,
            date: new Date().toISOString(),
            bankId: Number(selectedBankId) || banks[0]?.id,
            tabungId: type === 'savings' ? Number(selectedTabungId) : null,
            isFromRecurring: false
        };

        // Update bank balance
        if (selectedBankId) {
            const bank = banks.find(b => b.id === Number(selectedBankId));
            if (bank) {
                const newBalance = type === 'income' || type === 'savings' 
                    ? bank.balance + parseFloat(amount)
                    : bank.balance - parseFloat(amount);
                setBanks(banks.map(b => b.id === Number(selectedBankId) ? { ...b, balance: newBalance } : b));
            }
        }

        // Update tabung balance if savings
        if (type === 'savings' && selectedTabungId) {
            const tabung = tabungs.find(t => t.id === Number(selectedTabungId));
            if (tabung) {
                setTabungs(tabungs.map(t => t.id === Number(selectedTabungId) ? { ...t, current: t.current + parseFloat(amount) } : t));
            }
        }

        setTransactions([newTx, ...transactions]);
        setAmount('');
        setMerchant('');
        setCategory('');
        setSelectedBankId('');
        setSelectedTabungId('');
        setIsReflecting(false);
    };

    const handleDeleteTransaction = (id) => {
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        // Revert bank balance
        if (tx.bankId) {
            const bank = banks.find(b => b.id === tx.bankId);
            if (bank) {
                const newBalance = tx.type === 'income' || tx.type === 'savings' 
                    ? bank.balance - tx.amount
                    : bank.balance + tx.amount;
                setBanks(banks.map(b => b.id === tx.bankId ? { ...b, balance: newBalance } : b));
            }
        }

        // Revert tabung balance if savings
        if (tx.type === 'savings' && tx.tabungId) {
            const tabung = tabungs.find(t => t.id === tx.tabungId);
            if (tabung) {
                setTabungs(tabungs.map(t => t.id === tx.tabungId ? { ...t, current: t.current - tx.amount } : t));
            }
        }

        setTransactions(transactions.filter(t => t.id !== id));
    };

    return (
        <KansoContext.Provider value={{
            // Core
            hasOnboarded, setHasOnboarded,

            // Data Arrays
            transactions, setTransactions,
            banks, setBanks,
            tabungs, setTabungs,
            recurringExpenses, setRecurringExpenses,
            wishlist, setWishlist,

            // Monthly filtering
            currentMonth, setCurrentMonth,
            currentRealMonth,
            availableMonths,
            filteredTransactions,
            categoryTotals,

            // Derived State
            totalBalance,
            tabungsByBank,
            monthlyIncome,
            monthlyRecurringTotal,

            // Form State
            type, setType,
            amount, setAmount,
            merchant, setMerchant,
            category, setCategory,
            isReflecting, setIsReflecting,
            selectedBankId, setSelectedBankId,
            selectedTabungId, setSelectedTabungId,

            // Handlers
            handleOnboardingComplete,
            handleReflect,
            handleGoBack,
            handleConfirm,
            handleDeleteTransaction,

            // Theme
            isDark,
            toggleDark
        }}>
            {children}
        </KansoContext.Provider>
    );
}

export function useKanso() {
    return useContext(KansoContext);
}
