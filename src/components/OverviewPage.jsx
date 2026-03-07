import { useKanso } from '../context/KansoContext';
import { useState } from 'react';

export default function OverviewPage() {
    const [expandedSection, setExpandedSection] = useState(null);

    const {
        totalBalance,
        banks,
        tabungs,
        monthlyRecurringTotal,
        wishlist,
        recurringExpenses
    } = useKanso();

    const activeWishlistItems = wishlist.filter(item => !item.completed).length;

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="animate-fade-in space-y-12">
            {/* Total Balance */}
            <section className="text-center">
                <p className="tracking-widest text-xs uppercase mb-4 text-ink-light">
                    Total Balance
                </p>
                <h1 className="font-serif text-6xl md:text-8xl tracking-tight text-ink transition-all duration-500">
                    RM{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
            </section>

            {/* Summary Cards - Clickable to Expand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recurring */}
                <div 
                    className="border border-sand/30 rounded-lg p-6 cursor-pointer hover:border-sand/50 transition-colors"
                    onClick={() => toggleSection('recurring')}
                >
                    <h3 className="font-serif text-lg text-ink mb-4">
                        Recurring
                    </h3>
                    <p className="text-3xl font-serif text-ink mb-2">
                        RM{monthlyRecurringTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-ink-light">
                        Fixed monthly commitments
                    </p>

                    {expandedSection === 'recurring' && (
                        <div className="mt-4 pt-4 border-t border-sand/30 space-y-2">
                            {recurringExpenses.length === 0 ? (
                                <p className="text-sm text-ink-light">No recurring expenses</p>
                            ) : (
                                recurringExpenses.map((expense) => (
                                    <div key={expense.id} className="flex justify-between items-center text-sm">
                                        <span className="text-ink">{expense.name}</span>
                                        <span className="text-ink-light">
                                            RM{expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Wishlist */}
                <div 
                    className="border border-sand/30 rounded-lg p-6 cursor-pointer hover:border-sand/50 transition-colors"
                    onClick={() => toggleSection('wishlist')}
                >
                    <h3 className="font-serif text-lg text-ink mb-4">
                        Wishlist
                    </h3>
                    <p className="text-3xl font-serif text-ink mb-2">
                        {activeWishlistItems}
                    </p>
                    <p className="text-xs text-ink-light">
                        Items pending reflection
                    </p>

                    {expandedSection === 'wishlist' && (
                        <div className="mt-4 pt-4 border-t border-sand/30 space-y-2">
                            {wishlist.filter(item => !item.completed).length === 0 ? (
                                <p className="text-sm text-ink-light">No items in wishlist</p>
                            ) : (
                                wishlist
                                    .filter(item => !item.completed)
                                    .slice(0, 5)
                                    .map((item) => (
                                        <div key={item.id} className="flex justify-between items-center text-sm">
                                            <span className="text-ink">{item.name}</span>
                                            <span className="text-ink-light">
                                                RM{(item.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Banks Section */}
            <section>
                <h2 className="font-serif text-2xl text-ink mb-6">Your Banks</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {banks.map(bank => (
                        <div 
                            key={bank.id} 
                            className="border border-sand/30 rounded-lg p-5"
                            style={{ borderLeftColor: bank.color, borderLeftWidth: '4px' }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-serif text-xl text-ink">{bank.name}</h3>
                                    <p className="text-sm text-ink-light mt-1">
                                        Total Balance: RM{bank.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {banks.length === 0 && (
                        <p className="text-sm text-ink-light col-span-2">No banks added yet</p>
                    )}
                </div>
            </section>

            {/* Tabungs Section */}
            <section>
                <h2 className="font-serif text-2xl text-ink mb-6">Your Tabungs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tabungs.map(tabung => {
                        const bank = banks.find(b => b.id === tabung.bankId);
                        const progress = tabung.target ? (tabung.current / tabung.target) * 100 : 0;

                        return (
                            <div 
                                key={tabung.id} 
                                className="border border-sand/30 rounded-lg p-5"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-serif text-xl text-ink">{tabung.name}</h3>
                                        <p className="text-sm text-ink-light mt-1">
                                            {bank ? bank.name : 'No bank assigned'}
                                        </p>
                                    </div>
                                    <p className="font-serif text-lg text-ink">
                                        RM{tabung.current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>

                                {tabung.target && (
                                    <div>
                                        <div className="w-full bg-sand/30 rounded-full h-2">
                                            <div 
                                                className="bg-sage h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-ink-light mt-2">
                                            RM{tabung.current.toLocaleString()} / RM{tabung.target.toLocaleString()} ({progress.toFixed(0)}%)
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {tabungs.length === 0 && (
                        <p className="text-sm text-ink-light col-span-2">No tabungs created yet</p>
                    )}
                </div>
            </section>
        </div>
    );
}
