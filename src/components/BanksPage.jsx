import { useState } from 'react';
import { useKanso } from '../context/KansoContext';

export default function BanksPage() {
    const { banks, setBanks, tabungsByBank } = useKanso();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [newBankBalance, setNewBankBalance] = useState('');
    const [selectedFromBank, setSelectedFromBank] = useState(null);
    const [selectedToBank, setSelectedToBank] = useState(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [showTransferForm, setShowTransferForm] = useState(false);

    const handleAddBank = (e) => {
        e.preventDefault();
        if (!newBankName || !newBankBalance) return;

        const colors = ['#8BA888', '#D4A574', '#A8B4A5', '#C9B896', '#9CAF88'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newBank = {
            id: Date.now(),
            name: newBankName,
            balance: parseFloat(newBankBalance),
            color: randomColor
        };

        setBanks([...banks, newBank]);
        setNewBankName('');
        setNewBankBalance('');
        setShowAddForm(false);
    };

    const handleTransfer = (e) => {
        e.preventDefault();
        if (!selectedFromBank || !selectedToBank || !transferAmount) return;
        if (selectedFromBank === selectedToBank) return;

        const amount = parseFloat(transferAmount);
        const fromBank = banks.find(b => b.id === selectedFromBank);

        if (fromBank.balance < amount) return;

        setBanks(banks.map(bank => {
            if (bank.id === selectedFromBank) {
                return { ...bank, balance: bank.balance - amount };
            }
            if (bank.id === selectedToBank) {
                return { ...bank, balance: bank.balance + amount };
            }
            return bank;
        }));

        setTransferAmount('');
        setSelectedFromBank(null);
        setSelectedToBank(null);
        setShowTransferForm(false);
    };

    return (
        <div className="animate-fade-in space-y-16">
            <section>
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink mb-4">
                    Banks
                </h1>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Track your balances across all bank accounts.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-6 py-3 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                    >
                        Add Bank
                    </button>
                    {banks.length >= 2 && (
                        <button
                            onClick={() => setShowTransferForm(!showTransferForm)}
                            className="px-6 py-3 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                        >
                            Transfer
                        </button>
                    )}
                </div>
            </section>

            {/* Add Bank Form */}
            {showAddForm && (
                <section className="bg-paper border border-sand p-6 md:p-8 animate-fade-in">
                    <form onSubmit={handleAddBank} className="flex flex-col md:flex-row gap-6 md:items-end">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs uppercase tracking-widest text-ink-light block">Bank Name</label>
                            <input
                                type="text"
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                placeholder="e.g. Maybank"
                                className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                            />
                        </div>
                        <div className="space-y-2 w-full md:w-48">
                            <label className="text-xs uppercase tracking-widest text-ink-light block">Initial Balance</label>
                            <input
                                type="number"
                                value={newBankBalance}
                                onChange={(e) => setNewBankBalance(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="h-12 px-6 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newBankName || !newBankBalance}
                                className="h-12 px-6 border border-sage bg-sage text-white hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                            >
                                Add Bank
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Transfer Form */}
            {showTransferForm && (
                <section className="bg-paper border border-sand p-6 md:p-8 animate-fade-in">
                    <form onSubmit={handleTransfer} className="flex flex-col md:flex-row gap-6 md:items-end">
                        <div className="space-y-2 w-full md:w-48">
                            <label className="text-xs uppercase tracking-widest text-ink-light block">From</label>
                            <select
                                value={selectedFromBank || ''}
                                onChange={(e) => setSelectedFromBank(Number(e.target.value))}
                                className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                            >
                                <option value="">Select bank</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2 w-full md:w-48">
                            <label className="text-xs uppercase tracking-widest text-ink-light block">To</label>
                            <select
                                value={selectedToBank || ''}
                                onChange={(e) => setSelectedToBank(Number(e.target.value))}
                                className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                            >
                                <option value="">Select bank</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.id}>{bank.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2 w-full md:w-48">
                            <label className="text-xs uppercase tracking-widest text-ink-light block">Amount (RM)</label>
                            <input
                                type="number"
                                value={transferAmount}
                                onChange={(e) => setTransferAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setShowTransferForm(false)}
                                className="h-12 px-6 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedFromBank || !selectedToBank || !transferAmount}
                                className="h-12 px-6 border border-sage bg-sage text-white hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                            >
                                Transfer
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Banks List */}
            <section className="space-y-6">
                {banks.length === 0 ? (
                    <div className="text-center py-20 border border-sand/50 text-stone text-sm italic">
                        No banks added yet. Add your first bank to get started.
                    </div>
                ) : (
                    banks.map((bank, idx) => {
                        const bankTabungs = tabungsByBank[bank.id] || [];
                        const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;

                        return (
                            <div
                                key={bank.id}
                                className={`border border-sand p-6 md:p-8 animate-slide-up-slow ${staggerClass} transition-colors duration-500`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-serif text-ink">{bank.name}</h3>
                                        <p className="text-xs text-ink-light uppercase tracking-widest mt-1">
                                            {bankTabungs.length} {bankTabungs.length === 1 ? 'Tabung' : 'Tabungs'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl md:text-4xl font-serif text-ink tabular-nums">
                                            RM{bank.balance.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-ink-light uppercase tracking-widest mt-1">
                                            Balance
                                        </p>
                                    </div>
                                </div>

                                {bankTabungs.length > 0 && (
                                    <div className="border-t border-sand pt-6 space-y-4">
                                        {bankTabungs.map(tabung => (
                                            <div key={tabung.id} className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-ink">{tabung.name}</p>
                                                    <p className="text-xs text-ink-light mt-1">{tabung.purpose}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg text-ink tabular-nums">
                                                        RM{tabung.current.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-stone">
                                                        of RM{tabung.target.toLocaleString()} target
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
