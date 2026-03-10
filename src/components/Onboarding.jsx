import { useState, useEffect } from 'react';

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [banks, setBanks] = useState([{ name: '', balance: '' }]);
    const [tabungs, setTabungs] = useState([{ name: '', target: '', current: '', bankId: '' }]);
    const [recurring, setRecurring] = useState([{ name: '', amount: '', category: 'bills' }]);

    const expenseCategories = ['bills', 'food', 'transport', 'shopping', 'entertainment', 'health', 'other'];

    const handleAddBank = () => {
        setBanks([...banks, { name: '', balance: '' }]);
    };

    const handleAddTabung = () => {
        setTabungs([...tabungs, { name: '', target: '', current: '', bankId: '' }]);
    };

    const handleAddRecurring = () => {
        setRecurring([...recurring, { name: '', amount: '', category: 'bills' }]);
    };

    const handleBankChange = (index, field, value) => {
        const newBanks = [...banks];
        newBanks[index][field] = value;
        setBanks(newBanks);
    };

    const handleTabungChange = (index, field, value) => {
        const newTabungs = [...tabungs];
        newTabungs[index][field] = value;
        setTabungs(newTabungs);
    };

    const handleRecurringChange = (index, field, value) => {
        const newRecurring = [...recurring];
        newRecurring[index][field] = value;
        setRecurring(newRecurring);
    };

    const handleRemoveBank = (index) => {
        if (banks.length > 1) {
            setBanks(banks.filter((_, i) => i !== index));
        }
    };

    const handleRemoveTabung = (index) => {
        if (tabungs.length > 1) {
            setTabungs(tabungs.filter((_, i) => i !== index));
        }
    };

    const handleRemoveRecurring = (index) => {
        if (recurring.length > 1) {
            setRecurring(recurring.filter((_, i) => i !== index));
        }
    };

    const handleFinish = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            const initialBanks = banks
                .filter(b => b.name && b.balance)
                .map((b, i) => ({
                    id: Date.now() + i,
                    name: b.name,
                    balance: parseFloat(b.balance)
                }));

            const initialTabungs = tabungs
                .filter(t => t.name && t.target && t.bankId)
                .map((t, i) => ({
                    id: Date.now() + banks.length + i,
                    name: t.name,
                    target: parseFloat(t.target),
                    current: t.current ? parseFloat(t.current) : 0,
                    bankId: parseInt(t.bankId)
                }));

            const initialRecurring = recurring
                .filter(r => r.name && r.amount)
                .map((r, i) => ({
                    id: Date.now() + banks.length + tabungs.length + i,
                    name: r.name,
                    amount: parseFloat(r.amount),
                    category: r.category,
                    dueDate: 1,
                    isActive: true,
                    autoRecord: false
                }));

            onComplete({
                initialBanks,
                initialTabungs,
                initialRecurring
            });
        }, 800);
    };

    const nextStep = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setStep((s) => s + 1);
            setIsTransitioning(false);
        }, 800);
    };

    const prevStep = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            setStep((s) => s - 1);
            setIsTransitioning(false);
        }, 800);
    };

    useEffect(() => {
        if (step === 0 || step === 1) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                    setStep((s) => s + 1);
                    setIsTransitioning(false);
                }, 800);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [step]);

    return (
        <div className="fixed inset-0 bg-paper z-50 flex flex-col items-center justify-center min-h-screen px-6">
            <div className="absolute top-10 left-10 md:top-20 md:left-20">
                <h1 className="font-sans text-xs tracking-[0.3em] font-medium text-ink">
                    KANSO.
                </h1>
            </div>

            <div
                className={`max-w-2xl w-full text-center transition-opacity duration-800 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {step === 0 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink">
                            Welcome to Kanso.
                        </h2>
                        <p className="mt-6 text-lg text-ink-light font-light max-w-md mx-auto animate-slide-up-slow">
                            A quiet space for your finances.
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink">
                            Money is energy.
                        </h2>
                        <p className="mt-6 text-lg text-ink-light font-light max-w-md mx-auto animate-slide-up-slow">
                            Let&apos;s track its flow without judgment.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink mb-8">
                            Your Banks
                        </h2>
                        <p className="text-sm text-ink-light mb-12">Add your bank accounts</p>

                        <div className="space-y-6 mb-8">
                            {banks.map((bank, index) => (
                                <div key={index} className="border border-sand/30 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs uppercase tracking-widest text-ink-light">
                                            Bank {index + 1}
                                        </span>
                                        {banks.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBank(index)}
                                                className="text-xs text-stone hover:text-ink transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Bank name"
                                            value={bank.name}
                                            onChange={(e) => handleBankChange(index, 'name', e.target.value)}
                                            className="kanso-input w-full"
                                        />
                                        <div className="flex items-center justify-center text-2xl font-serif">
                                            <span className="mr-2 text-stone opacity-50">RM</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={bank.balance}
                                                onChange={(e) => handleBankChange(index, 'balance', e.target.value)}
                                                className="kanso-input text-center w-32"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddBank}
                            className="text-sm text-sage hover:text-ink transition-colors mb-8 active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            + Add another bank
                        </button>

                        <div className="flex justify-center space-x-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="text-sm tracking-widest uppercase text-stone hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="text-sm tracking-widest uppercase text-ink hover:text-sage transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink mb-8">
                            Your Tabungs
                        </h2>
                        <p className="text-sm text-ink-light mb-12">Add your savings goals</p>

                        <div className="space-y-6 mb-8">
                            {tabungs.map((tabung, index) => (
                                <div key={index} className="border border-sand/30 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs uppercase tracking-widest text-ink-light">
                                            Tabung {index + 1}
                                        </span>
                                        {tabungs.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTabung(index)}
                                                className="text-xs text-stone hover:text-ink transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Tabung name"
                                            value={tabung.name}
                                            onChange={(e) => handleTabungChange(index, 'name', e.target.value)}
                                            className="kanso-input w-full"
                                        />
                                        <div className="flex items-center justify-center text-2xl font-serif">
                                            <span className="mr-2 text-stone opacity-50">RM</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Target"
                                                value={tabung.target}
                                                onChange={(e) => handleTabungChange(index, 'target', e.target.value)}
                                                className="kanso-input text-center w-32"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center text-2xl font-serif">
                                            <span className="mr-2 text-stone opacity-50">RM</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Saved"
                                                value={tabung.current}
                                                onChange={(e) => handleTabungChange(index, 'current', e.target.value)}
                                                className="kanso-input text-center w-32"
                                            />
                                        </div>
                                        <select
                                            value={tabung.bankId}
                                            onChange={(e) => handleTabungChange(index, 'bankId', e.target.value)}
                                            className="kanso-input w-full"
                                        >
                                            <option value="">Select bank</option>
                                            {banks
                                                .filter(b => b.name)
                                                .map((bank, i) => (
                                                    <option key={i} value={i}>
                                                        {bank.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddTabung}
                            className="text-sm text-sage hover:text-ink transition-colors mb-8 active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            + Add another tabung
                        </button>

                        <div className="flex justify-center space-x-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="text-sm tracking-widest uppercase text-stone hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={nextStep}
                                className="text-sm tracking-widest uppercase text-ink hover:text-sage transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink mb-8">
                            Recurring Expenses
                        </h2>
                        <p className="text-sm text-ink-light mb-12">Add your fixed monthly expenses</p>

                        <div className="space-y-6 mb-8">
                            {recurring.map((expense, index) => (
                                <div key={index} className="border border-sand/30 rounded-lg p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs uppercase tracking-widest text-ink-light">
                                            Expense {index + 1}
                                        </span>
                                        {recurring.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRecurring(index)}
                                                className="text-xs text-stone hover:text-ink transition-colors"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Expense name"
                                            value={expense.name}
                                            onChange={(e) => handleRecurringChange(index, 'name', e.target.value)}
                                            className="kanso-input w-full"
                                        />
                                        <div className="flex items-center justify-center text-2xl font-serif">
                                            <span className="mr-2 text-stone opacity-50">RM</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="Amount"
                                                value={expense.amount}
                                                onChange={(e) => handleRecurringChange(index, 'amount', e.target.value)}
                                                className="kanso-input text-center w-32"
                                            />
                                        </div>
                                        <select
                                            value={expense.category}
                                            onChange={(e) => handleRecurringChange(index, 'category', e.target.value)}
                                            className="kanso-input w-full"
                                        >
                                            {expenseCategories.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleAddRecurring}
                            className="text-sm text-sage hover:text-ink transition-colors mb-8 active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            + Add another expense
                        </button>

                        <div className="flex justify-center space-x-8">
                            <button
                                type="button"
                                onClick={prevStep}
                                className="text-sm tracking-widest uppercase text-stone hover:text-ink transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={handleFinish}
                                className="text-sm tracking-widest uppercase text-ink hover:text-sage transition-colors active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                            >
                                Start
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
