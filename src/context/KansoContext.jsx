import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTauriStorage } from '../hooks/useTauriStorage';
import { initialTransactions } from '../data/initialTransactions';

const INITIAL_BANKS = [
    { id: 1, name: 'Maybank', balance: 5000, color: '#8BA888' },
    { id: 2, name: 'CIMB', balance: 3000, color: '#D4A574' }
];

const INITIAL_TABUNGS = [
    { id: 1, name: 'Emergency Fund', bankId: 1, target: 10000, current: 5000, purpose: 'rainy days', color: '#8BA888' },
    { id: 2, name: 'Credit Card Payment', bankId: 1, target: 2000, current: 800, purpose: 'upcoming payment', color: '#D4A574' },
    { id: 3, name: 'Japan Trip', bankId: 2, target: 15000, current: 3000, purpose: 'future plan', color: '#A8B4A5' }
];

const INITIAL_RECURRING_EXPENSES = [
    { id: 1, name: 'Rent', amount: 1200, category: 'Housing', dueDate: 1, isActive: true, autoRecord: true },
    { id: 2, name: 'Internet', amount: 100, category: 'Utilities', dueDate: 5, isActive: true, autoRecord: true },
    { id: 3, name: 'Streaming', amount: 15, category: 'Entertainment', dueDate: 15, isActive: true, autoRecord: true }
];

const INITIAL_RECEIPT_SETTINGS = {
    ollamaEnabled: true,
    ollamaModel: 'moondream',
    ollamaBaseUrl: 'http://localhost:11434',
    autoCategory: true,
    defaultTaxYear: 2025,
    activeTaxYear: 2025
};

const TAX_RELIEF_CATEGORIES = [
    { id: 'medical', name: 'Medical', limit: 8000, color: '#8BA888' },
    { id: 'lifestyle', name: 'Lifestyle', limit: 2500, color: '#D4A574' },
    { id: 'sports', name: 'Sports', limit: 500, color: '#A8B4A5' },
    { id: 'education', name: 'Education', limit: 7000, color: '#C9B896' },
    { id: 'other', name: 'Other', limit: null, color: '#9A8A7A' }
];

const KansoContext = createContext();

export function KansoProvider({ children }) {
    // ─── Primitive State ──────────────────────────────
    const [hasOnboarded, setHasOnboarded] = useTauriStorage('kanso_onboarded', false);
    const [transactions, setTransactions] = useTauriStorage('kanso_transactions', initialTransactions);
    const [currentMonth, setCurrentMonth] = useTauriStorage('kanso_current_month', 'all');
    const [isDark, setIsDark] = useTauriStorage('kanso_dark_mode', false);

    // Get current real-time month
    const getCurrentMonthKey = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const currentRealMonth = getCurrentMonthKey();

    const [banks, setBanks] = useTauriStorage('kanso_banks', INITIAL_BANKS);

    const [tabungs, setTabungs] = useTauriStorage('kanso_tabungs', INITIAL_TABUNGS);

    const [recurringExpenses, setRecurringExpenses] = useTauriStorage('kanso_recurring_expenses', INITIAL_RECURRING_EXPENSES);

    // Wishlist (Items you're saving for)
    const [wishlist, setWishlist] = useTauriStorage('kanso_wishlist', []);

    const [receipts, setReceipts] = useTauriStorage('kanso_receipts', []);
    const [receiptSettings, setReceiptSettings] = useTauriStorage('kanso_receipt_settings', INITIAL_RECEIPT_SETTINGS);

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

    // Tax relief totals for current year
    const activeTaxYear = useMemo(() => {
        return receiptSettings.activeTaxYear ?? receiptSettings.defaultTaxYear;
    }, [receiptSettings.activeTaxYear, receiptSettings.defaultTaxYear]);
    const currentYearReceipts = useMemo(() => {
        return receipts.filter(r => (r.taxYear ?? activeTaxYear) === activeTaxYear);
    }, [receipts, activeTaxYear]);

    const taxReliefTotals = useMemo(() => {
        return TAX_RELIEF_CATEGORIES.reduce((acc, cat) => {
            acc[cat.id] = currentYearReceipts
                .filter(r => r.finalCategory === cat.id)
                .reduce((sum, r) => sum + r.finalAmount, 0);
            return acc;
        }, {});
    }, [currentYearReceipts]);

    // Receipt stats
    const receiptStats = useMemo(() => {
        const totalClaimed = currentYearReceipts.reduce((sum, r) => sum + r.finalAmount, 0);
        const totalVerified = currentYearReceipts.filter(r => r.isVerified).length;
        
        return {
            totalReceipts: currentYearReceipts.length,
            totalClaimed,
            totalVerified,
            totalUnverified: currentYearReceipts.length - totalVerified
        };
    }, [currentYearReceipts]);

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

    const handleAddReceipt = (receipt) => {
        const activeTaxYear = receiptSettings.activeTaxYear ?? receiptSettings.defaultTaxYear;
        const createdAt = new Date().toISOString();
        const newReceipt = {
            ...receipt,
            id: Date.now(),
            createdAt,
            updatedAt: createdAt,
            taxYear: receipt.taxYear ?? activeTaxYear,
            isVerified: receipt.isVerified ?? false
        };
        setReceipts((prev) => [newReceipt, ...prev]);
    };

    const handleUpdateReceipt = (id, updates) => {
        setReceipts(receipts.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r));
    };

    const handleDeleteReceipt = (id) => {
        setReceipts(receipts.filter(r => r.id !== id));
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
            toggleDark,

            // Receipts
            receipts, setReceipts,
            receiptSettings, setReceiptSettings,
            TAX_RELIEF_CATEGORIES,
            taxReliefTotals,
            receiptStats,
            handleAddReceipt,
            handleUpdateReceipt,
            handleDeleteReceipt
        }}>
            {children}
        </KansoContext.Provider>
    );
}

export function useKanso() {
    return useContext(KansoContext);
}
