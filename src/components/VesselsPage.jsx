import { useMemo } from 'react';
import { useKanso } from '../context/KansoContext';

export default function VesselsPage() {
    const {
        vessels,
        setVessels,
        filteredTransactions: transactions,
        startingBalanceForPeriod: startingBalance
    } = useKanso();
    // Expenses are categorized into vessels, which drain from them.
    // So the current 'fill' of a vessel is its explicit allocation MINUS its expenses.

    const vesselExpenses = useMemo(() => {
        const expenses = {};
        vessels.forEach(v => expenses[v.name] = 0);

        transactions.forEach(tx => {
            if (tx.type === 'expense' && expenses[tx.category] !== undefined) {
                expenses[tx.category] += tx.amount;
            }
        });
        return expenses;
    }, [transactions, vessels]);

    const totalIncome = useMemo(() => {
        return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    const globalUnallocatedExpenses = useMemo(() => {
        return transactions.filter(t => t.type === 'expense' && !vessels.find(v => v.name === t.category)).reduce((sum, t) => sum + t.amount, 0);
    }, [transactions, vessels]);

    const totalAllocated = useMemo(() => {
        return vessels.reduce((sum, v) => sum + v.allocated, 0);
    }, [vessels]);

    const unallocatedEnergy = startingBalance + totalIncome - totalAllocated - globalUnallocatedExpenses;

    const handleAllocate = (id, newAmount) => {
        const amount = Math.max(0, parseFloat(newAmount) || 0);
        setVessels(vessels.map(v => v.id === id ? { ...v, allocated: amount } : v));
    };

    return (
        <div className="animate-fade-in space-y-16 pb-20">
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink">
                        Vessels
                    </h1>
                </div>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Money is not a budget to restrict, but energy to direct. Pour your unallocated energy into vessels to sustain what matters most.
                </p>

                <div className="p-8 border border-sand bg-paper mb-16 flex flex-col md:flex-row items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-ink-light mb-2">Unallocated Energy</p>
                        <h2 className={`font-serif text-4xl ${unallocatedEnergy < 0 ? 'text-stone' : 'text-sage'}`}>
                            RM${unallocatedEnergy.toFixed(2)}
                        </h2>
                    </div>
                    <div className="text-sm text-ink-light mt-4 md:mt-0 max-w-sm text-center md:text-right">
                        This reflects your starting balance plus any income, minus what you poured into vessels and unassigned expenses.
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vessels.map((vessel, idx) => {
                    const expenses = vesselExpenses[vessel.name] || 0;
                    const remaining = vessel.allocated - expenses;
                    const fillPercent = vessel.allocated > 0 ? Math.min(100, Math.max(0, (remaining / vessel.allocated) * 100)) : 0;

                    const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;
                    const isEmpty = remaining <= 0;

                    return (
                        <div key={vessel.id} className={`p-8 border border-sand flex flex-col justify-between animate-slide-up-slow ${staggerClass} relative overflow-hidden group`}>

                            {/* Visual Fill Background */}
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-sage/10 -z-10 transition-all duration-1000 ease-in-out"
                                style={{ height: `${fillPercent}%` }}
                            />

                            <div>
                                <h3 className="font-serif text-3xl text-ink mb-2">{vessel.name}</h3>
                                <div className="text-xs mt-4 uppercase tracking-widest text-ink-light mb-6 flex justify-between">
                                    <span>Remaining</span>
                                    <span className={isEmpty ? 'text-stone italic' : 'text-ink'}>
                                        RM${remaining.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-stone block mb-1">Total Allocated</label>
                                    <div className="flex items-center text-lg text-ink font-serif">
                                        RM
                                        <input
                                            type="number"
                                            value={vessel.allocated || ''}
                                            onChange={(e) => handleAllocate(vessel.id, e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-transparent border-b border-dashed border-sand/50 focus:border-ink outline-none ml-1 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-sand/30 flex justify-between text-[10px] uppercase tracking-widest text-stone">
                                    <span>Energy Used</span>
                                    <span>RM${expenses.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}
