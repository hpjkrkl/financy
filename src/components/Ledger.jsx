import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export default function Ledger({ transactions, onDelete }) {
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = (id) => {
        setDeletingId(id);
        setTimeout(() => {
            if (onDelete) onDelete(id);
            setDeletingId(null);
        }, 500);
    };

    const groupedTransactions = useMemo(() => {
        const groups = [];

        const formatTxDate = (isoString) => {
            const date = new Date(isoString);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) return 'Today';
            if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

            return date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
        };

        transactions.forEach(tx => {
            const formattedDate = formatTxDate(tx.date);
            const enrichedTx = { ...tx, displayDate: formattedDate };
            groups.push(enrichedTx);
        });

        return groups;
    }, [transactions]);
    return (
        <section>
            <div className="flex justify-between items-end border-b border-sand pb-4 mb-8">
                <h2 className="font-serif text-2xl text-ink">Recent</h2>
                <span className="text-xs tracking-widest text-ink-light cursor-pointer hover:opacity-70 transition-opacity duration-300">
                    View All
                </span>
            </div>

            <div className="space-y-2">
                {groupedTransactions.map((tx, idx) => {
                    const showDate = idx === 0 || tx.displayDate !== groupedTransactions[idx - 1].displayDate;
                    const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;

                    return (
                        <React.Fragment key={tx.id}>
                            {/* Date group header */}
                            {showDate && (
                                <div className="text-xs tracking-widest uppercase mt-8 mb-4 text-stone animate-fade-in">
                                    {tx.displayDate}
                                </div>
                            )}

                            {/* Transaction row */}
                            <div
                                className={`flex justify-between items-center group transition-all duration-500 ease-in-out overflow-hidden ${deletingId === tx.id
                                        ? 'opacity-0 scale-95 max-h-0 py-0 blur-sm'
                                        : `animate-slide-down ${staggerClass} max-h-20 py-2 opacity-100 scale-100 blur-none`
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm text-ink transition-transform duration-300 ease-out group-hover:translate-x-2">
                                        {tx.merchant}
                                    </span>
                                    <span className="text-xs mt-1 text-ink-light">
                                        {tx.category}
                                    </span>
                                </div>
                                <div className="flex items-center translate-x-0 group-hover:-translate-x-2 transition-transform duration-300">
                                    <span
                                        className={`text-sm font-medium tabular-nums ${tx.type === 'expense' ? 'text-ink' : 'text-sage'
                                            }`}
                                    >
                                        {tx.type === 'expense' ? '−' : '+'} ${tx.amount.toFixed(2)}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(tx.id)}
                                        className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-stone hover:text-ink cursor-pointer focus:outline-none"
                                        aria-label="Undo transaction"
                                        title="Undo transaction"
                                    >
                                        <X size={16} strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </section>
    );
}
