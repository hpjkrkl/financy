import React, { createContext, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialTransactions } from '../data/initialTransactions';

const KansoContext = createContext();

export function KansoProvider({ children }) {
    // ─── Primitive State ──────────────────────────────
    const [hasOnboarded, setHasOnboarded] = useLocalStorage('kanso_onboarded', false);
    const [startingBalance, setStartingBalance] = useLocalStorage('kanso_starting_balance', 0);
    const [transactions, setTransactions] = useLocalStorage('kanso_transactions', initialTransactions);

    const [patienceQueue, setPatienceQueue] = useLocalStorage('kanso_patience_queue', []);
    const [vessels, setVessels] = useLocalStorage('kanso_vessels', [
        { id: 1, name: 'Foundation', allocated: 0 },
        { id: 2, name: 'Growth', allocated: 0 },
        { id: 3, name: 'Joy', allocated: 0 }
    ]);

    const [currentMonth, setCurrentMonth] = useLocalStorage('kanso_current_month', 'all');
    const [isDark, setIsDark] = useLocalStorage('kanso_dark_mode', false);
    const [rhythms, setRhythms] = useLocalStorage('kanso_rhythms', [
        { id: 1, name: 'Rent', amount: 1200, vessel: 'Foundation' },
        { id: 2, name: 'Streaming', amount: 15, vessel: 'Joy' },
    ]);

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

    const globalBalance = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const globalUnallocatedExpenses = transactions.filter(t => t.type === 'expense' && !vessels.find(v => v.name === t.category)).reduce((sum, t) => sum + t.amount, 0);
        const totalAllocated = vessels.reduce((sum, v) => sum + v.allocated, 0);
        return startingBalance + totalIncome - totalAllocated - globalUnallocatedExpenses;
    }, [transactions, startingBalance, vessels]);

    const startingBalanceForPeriod = useMemo(() => {
        if (currentMonth === 'all') return startingBalance;
        const previousTransactions = transactions.filter(t => t.date < currentMonth);
        return previousTransactions.reduce((acc, tx) => {
            return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
        }, startingBalance);
    }, [transactions, startingBalance, currentMonth]);

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

    const totalExpenses = useMemo(
        () => categoryTotals.reduce((sum, cat) => sum + cat.total, 0),
        [categoryTotals]
    );

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

    // ─── Handlers ───────────────────────────────────
    const handleOnboardingComplete = (initialBalance) => {
        setStartingBalance(initialBalance);
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
        };

        setTransactions([newTx, ...transactions]);
        setAmount('');
        setMerchant('');
        setCategory('');
        setIsReflecting(false);
    };

    const handleDeleteTransaction = (id) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    return (
        <KansoContext.Provider value={{
            // Core
            hasOnboarded, setHasOnboarded,
            startingBalance, setStartingBalance,

            // Data Arrays
            transactions, setTransactions,
            patienceQueue, setPatienceQueue,
            vessels, setVessels,

            // Monthly filtering
            currentMonth, setCurrentMonth,
            availableMonths,
            filteredTransactions,
            startingBalanceForPeriod,
            categoryTotals,
            totalExpenses,

            // Overall unallocated energy
            balance: globalBalance,

            // Form State
            type, setType,
            amount, setAmount,
            merchant, setMerchant,
            category, setCategory,
            isReflecting, setIsReflecting,

            // Handlers
            handleOnboardingComplete,
            handleReflect,
            handleGoBack,
            handleConfirm,
            handleDeleteTransaction,

            // Theme
            isDark,
            toggleDark,

            // Rhythms
            rhythms,
            setRhythms
        }}>
            {children}
        </KansoContext.Provider>
    );
}

export function useKanso() {
    return useContext(KansoContext);
}
