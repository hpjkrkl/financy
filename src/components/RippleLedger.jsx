import React, { useState, useEffect } from 'react';

export default function RippleLedger({ transactions }) {
    const [hoveredTx, setHoveredTx] = useState(null);

    const sortedTransactions = React.useMemo(() => {
        return [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions]);

    const maxAmount = React.useMemo(() => {
        if (sortedTransactions.length === 0) return 100;
        return Math.max(...sortedTransactions.map(t => t.amount));
    }, [sortedTransactions]);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <section>
            <div className="flex justify-between items-end border-b border-sand pb-4 mb-8">
                <h2 className="font-serif text-2xl text-ink">Ripple View</h2>
                <span className="text-xs tracking-widest text-ink-light">
                    {sortedTransactions.length} ripples
                </span>
            </div>

            <div className="relative min-h-[400px]">
                {sortedTransactions.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-ink-light text-sm">
                        No ripples yet. Your first transaction will create a wave.
                    </div>
                ) : (
                    <div className="relative">
                        {sortedTransactions.map((tx, index) => {
                            const isExpense = tx.type === 'expense';
                            const sizePercent = 30 + (tx.amount / maxAmount) * 60;
                            const delay = index * 0.1;
                            
                            const angle = (index * 137.5) % 360;
                            const radius = 80 + (index % 3) * 40;
                            const x = 50 + radius * Math.cos(angle * Math.PI / 180);
                            const y = 50 + radius * Math.sin(angle * Math.PI / 180);

                            return (
                                <div
                                    key={tx.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{
                                        left: `${x}%`,
                                        top: `${y}%`,
                                        animationDelay: `${delay}s`
                                    }}
                                    onMouseEnter={() => setHoveredTx(tx)}
                                    onMouseLeave={() => setHoveredTx(null)}
                                >
                                    <div
                                        className={`rounded-full transition-all duration-500 ease-out
                                            ${isExpense 
                                                ? 'bg-ink/10 border-2 border-ink' 
                                                : 'bg-sage/10 border-2 border-sage'
                                            }`}
                                        style={{
                                            width: `${sizePercent}px`,
                                            height: `${sizePercent}px`,
                                        }}
                                    >
                                        <div
                                            className={`absolute inset-0 rounded-full animate-pulse-slow
                                                ${isExpense ? 'bg-ink/20' : 'bg-sage/20'}`}
                                        />
                                        
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span
                                                className={`text-xs font-medium tabular-nums
                                                    ${isExpense ? 'text-ink' : 'text-sage'}`}
                                            >
                                                {isExpense ? '−' : '+'}{tx.amount.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>

                                    {hoveredTx?.id === tx.id && (
                                        <div
                                            className={`absolute z-10 w-64 p-4 rounded-lg shadow-xl
                                                ${isExpense ? 'bg-ink text-paper' : 'bg-sage text-paper'}
                                                animate-fade-in`}
                                            style={{
                                                left: '50%',
                                                top: '50%',
                                                transform: 'translate(-50%, -100%) translateY(-16px)'
                                            }}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-serif text-lg">
                                                        {tx.merchant}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-1">
                                                        {tx.category}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-lg">
                                                        {isExpense ? '−' : '+'} RM{tx.amount.toFixed(2)}
                                                    </div>
                                                    <div className="text-xs opacity-70 mt-1">
                                                        {formatDate(tx.date)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs opacity-50">
                                                {formatTime(tx.date)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
