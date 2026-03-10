import { useEffect, useState } from 'react';
import { useKanso } from '../context/KansoContext';
import { useTauriStorage } from '../hooks/useTauriStorage';
import { initialTransactions } from '../data/initialTransactions';

const INITIAL_RECEIPT_SETTINGS = {
    ollamaEnabled: true,
    ollamaModel: 'moondream',
    ollamaBaseUrl: 'http://localhost:11434',
    autoCategory: true,
    defaultTaxYear: 2025,
    activeTaxYear: 2025
};

export default function SettingsPage() {
    const { 
        setHasOnboarded,
        isDark,
        toggleDark,
        banks,
        tabungs,
        recurringExpenses,
        wishlist,
        receipts,
        setTransactions,
        setCurrentMonth,
        setBanks,
        setTabungs,
        setRecurringExpenses,
        setWishlist,
        setReceipts,
        setReceiptSettings
    } = useKanso();

    const [storedUserName, setStoredUserName, isUserNameLoading] = useTauriStorage('kanso_userName', '');
    const [storedCurrency, setStoredCurrency, isCurrencyLoading] = useTauriStorage('kanso_currency', 'RM');

    const [userName, setUserName] = useState('');
    const [currency, setCurrency] = useState('RM');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    useEffect(() => {
        function syncUserName() {
            if (!isUserNameLoading) {
                setUserName(storedUserName || '');
            }
        }
        syncUserName();
    }, [isUserNameLoading, storedUserName]);

    useEffect(() => {
        function syncCurrency() {
            if (!isCurrencyLoading) {
                setCurrency(storedCurrency || 'RM');
            }
        }
        syncCurrency();
    }, [isCurrencyLoading, storedCurrency]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setStoredUserName(userName);
        setStoredCurrency(currency);
    };

    const handleResetOnboarding = () => {
        setStoredUserName('');
        setStoredCurrency('RM');

        setBanks([]);
        setTabungs([]);
        setRecurringExpenses([]);
        setTransactions(initialTransactions);
        setWishlist([]);
        setReceipts([]);
        setReceiptSettings(INITIAL_RECEIPT_SETTINGS);
        setCurrentMonth('all');
        if (isDark) toggleDark();
        setHasOnboarded(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl text-ink mb-12">Settings</h1>

            <div className="space-y-12">
                <section>
                    <h2 className="text-sm tracking-widest uppercase text-ink-light mb-6">Profile</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div>
                            <label className="block text-sm text-ink mb-2">Name</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Your name"
                                className="kanso-input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-ink mb-2">Currency</label>
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="kanso-input w-full"
                            >
                                <option value="RM">RM - Malaysian Ringgit</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="SGD">SGD - Singapore Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="text-sm tracking-widest uppercase text-ink hover:text-sage transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            Save Profile
                        </button>
                    </form>
                </section>

                <section>
                    <h2 className="text-sm tracking-widest uppercase text-ink-light mb-6">Account Summary</h2>
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-ink-light">Banks</span>
                            <span className="text-ink">{banks.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-light">Tabungs</span>
                            <span className="text-ink">{tabungs.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-light">Recurring Expenses</span>
                            <span className="text-ink">{recurringExpenses.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-light">Wishlist</span>
                            <span className="text-ink">{wishlist.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-ink-light">Receipts</span>
                            <span className="text-ink">{receipts.length}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-sm tracking-widest uppercase text-ink-light mb-6">Danger Zone</h2>
                    {!showResetConfirm ? (
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="text-sm tracking-widest uppercase text-stone hover:text-red-500 transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700/30 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            Reset Onboarding
                        </button>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-ink-light">
                                This will delete all your data and restart the onboarding process. This action cannot be undone.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleResetOnboarding}
                                    className="text-sm tracking-widest uppercase text-red-500 hover:text-red-600 transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700/30 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                >
                                    Confirm Reset
                                </button>
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="text-sm tracking-widest uppercase text-ink hover:text-sage transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
