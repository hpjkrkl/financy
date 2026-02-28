import React, { useState } from 'react';
import { Plus, Clock, Check, X } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function PatienceQueue() {
    const { patienceQueue: items, setPatienceQueue: setItems } = useKanso();
    const [name, setName] = useState('');
    const [cost, setCost] = useState('');
    const [waitDays, setWaitDays] = useState(7);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!name || !cost) return;

        const newItem = {
            id: Date.now(),
            name,
            cost: parseFloat(cost),
            waitDays: parseInt(waitDays, 10),
            dateAdded: new Date().toISOString(),
        };

        setItems([newItem, ...items]);
        setName('');
        setCost('');
        setWaitDays(7);
    };

    const handleRelease = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleAcquire = (item) => {
        setItems(items.map(i => 
            i.id === item.id 
                ? { ...i, status: 'purchased', purchasedAt: new Date().toISOString() }
                : i
        ));
    };

    const calculateDaysRemaining = (item) => {
        const added = new Date(item.dateAdded);
        const ready = new Date(added.getTime() + item.waitDays * 24 * 60 * 60 * 1000);
        const diff = ready - new Date();
        if (diff <= 0) return 0;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="animate-fade-in space-y-16">
            <section>
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink mb-4">
                    Patience Queue
                </h1>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Instead of purchasing immediately, place your desires here. Allow time to reveal whether they truly serve your journey.
                </p>

                {/* Add Item Form */}
                <form onSubmit={handleAdd} className="bg-paper border border-sand p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs uppercase tracking-widest text-ink-light block">Desire</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Mechanical Keyboard"
                            className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                        />
                    </div>
                    <div className="space-y-2 w-full md:w-32">
                        <label className="text-xs uppercase tracking-widest text-ink-light block">Energy (RM)</label>
                        <input
                            type="number"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                        />
                    </div>
                    <div className="space-y-2 w-full md:w-32">
                        <label className="text-xs uppercase tracking-widest text-ink-light block">Wait (Days)</label>
                        <select
                            value={waitDays}
                            onChange={(e) => setWaitDays(e.target.value)}
                            className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                        >
                            <option value={7}>7 Days</option>
                            <option value={14}>14 Days</option>
                            <option value={30}>30 Days</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={!name || !cost}
                        className="h-12 w-12 flex-shrink-0 flex items-center justify-center border border-sand hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4 md:mt-0"
                    >
                        <Plus size={20} strokeWidth={1.5} />
                    </button>
                </form>
            </section>

            <section className="space-y-6">
                {items.filter(item => item.status !== 'purchased').length === 0 ? (
                    <div className="text-center py-20 border border-sand/50 text-stone text-sm italic">
                        Your mind is clear. No desires currently pending.
                    </div>
                ) : (
                    items.filter(item => item.status !== 'purchased').map((item, idx) => {
                        const daysLeft = calculateDaysRemaining(item);
                        const isReady = daysLeft === 0;
                        const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;

                        return (
                            <div
                                key={item.id}
                                className={`flex flex-col md:flex-row justify-between md:items-center p-6 border ${isReady ? 'border-sage/50 bg-sage/5' : 'border-sand'} animate-slide-up-slow ${staggerClass} transition-colors duration-500`}
                            >
                                <div>
                                    <h3 className="text-xl md:text-2xl font-serif text-ink">{item.name}</h3>
                                    <p className="text-sm text-ink-light mt-1 tabular-nums">RM{item.cost.toFixed(2)}</p>
                                </div>

                                <div className="mt-6 md:mt-0 flex items-center gap-6">
                                    {isReady ? (
                                        <div className="flex flex-col items-end gap-3 translate-x-0 animate-fade-in w-full md:w-auto">
                                            <span className="text-sm italic text-sage flex items-center gap-2">
                                                <Check size={16} strokeWidth={1.5} />
                                                Ready for reflection. Still needed?
                                            </span>
                                            <div className="flex gap-4 w-full md:w-auto">
                                                <button onClick={() => handleRelease(item.id)} className="flex-1 md:flex-none border border-sand px-4 py-2 text-xs uppercase tracking-widest text-ink hover:bg-ink hover:text-paper transition-all">
                                                    Release Desire
                                                </button>
                                                <button onClick={() => handleAcquire(item)} className="flex-1 md:flex-none border border-sage bg-sage text-white px-4 py-2 text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                                                    Acquire
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-ink-light">
                                            <Clock size={16} strokeWidth={1.5} className="text-stone animate-pulse" />
                                            <span className="text-sm tabular-nums tracking-widest">
                                                {daysLeft} {daysLeft === 1 ? 'DAY' : 'DAYS'} REMAINING
                                            </span>
                                            <button
                                                onClick={() => handleRelease(item.id)}
                                                className="ml-6 text-stone hover:text-ink transition-colors p-2"
                                                aria-label="Remove item"
                                            >
                                                <X size={16} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
