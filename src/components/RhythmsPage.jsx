import { useState } from 'react';
import { Plus, X, Repeat2 } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function RhythmsPage() {
    const { rhythms, setRhythms, vessels } = useKanso();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [vessel, setVessel] = useState('');

    const totalMonthly = rhythms.reduce((sum, r) => sum + r.amount, 0);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!name || !amount) return;
        const newRhythm = {
            id: Date.now(),
            name,
            amount: parseFloat(amount),
            vessel: vessel || 'Unallocated',
        };
        setRhythms([...rhythms, newRhythm]);
        setName('');
        setAmount('');
        setVessel('');
    };

    const handleRemove = (id) => {
        setRhythms(rhythms.filter(r => r.id !== id));
    };

    return (
        <div className="animate-fade-in space-y-16">
            {/* Header */}
            <section>
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink mb-4">
                    Rhythms
                </h1>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-4">
                    Steady, predictable currents of energy — subscriptions, rent, memberships. Not burdens, but rhythms of your chosen life.
                </p>
                <div className="flex items-end gap-2">
                    <span className="text-xs uppercase tracking-widest text-ink-light">Total Monthly Flow</span>
                    <span className="font-serif text-2xl text-ink">RM{totalMonthly.toFixed(2)}</span>
                </div>
            </section>

            {/* Add Form */}
            <section>
                <form onSubmit={handleAdd} className="bg-paper border border-sand p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-end">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-ink-light block">Rhythm</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Spotify"
                            className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                        />
                    </div>
                    <div className="space-y-1 w-full md:w-28">
                        <label className="text-[10px] uppercase tracking-widest text-ink-light block">Monthly ($)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                        />
                    </div>
                    <div className="space-y-1 w-full md:w-32">
                        <label className="text-[10px] uppercase tracking-widest text-ink-light block">Vessel</label>
                        <select
                            value={vessel}
                            onChange={e => setVessel(e.target.value)}
                            className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                        >
                            <option value="">None</option>
                            {vessels.map(v => (
                                <option key={v.id} value={v.name}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={!name || !amount}
                        className="h-12 w-12 flex-shrink-0 flex items-center justify-center border border-sand hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300 disabled:opacity-40"
                    >
                        <Plus size={20} strokeWidth={1.5} />
                    </button>
                </form>
            </section>

            {/* Rhythms List */}
            <section className="space-y-4">
                {rhythms.length === 0 ? (
                    <div className="text-center py-20 border border-sand/50 text-stone text-sm italic">
                        No rhythms yet. Your schedule is open.
                    </div>
                ) : (
                    rhythms.map((r, idx) => (
                        <div
                            key={r.id}
                            className={`flex justify-between items-center p-6 border border-sand animate-slide-up-slow stagger-${Math.min(idx + 1, 5)} group`}
                        >
                            <div className="flex items-center gap-4">
                                <Repeat2 size={16} strokeWidth={1.5} className="text-stone group-hover:text-sage transition-colors" />
                                <div>
                                    <p className="text-lg font-serif text-ink">{r.name}</p>
                                    {r.vessel !== 'Unallocated' && (
                                        <p className="text-xs text-ink-light tracking-widest uppercase mt-0.5">→ {r.vessel}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="font-serif text-xl text-ink tabular-nums">RM{r.amount.toFixed(2)}<span className="text-xs text-ink-light ml-1">/mo</span></span>
                                <button
                                    onClick={() => handleRemove(r.id)}
                                    className="opacity-0 group-hover:opacity-100 text-stone hover:text-ink transition-all p-1"
                                    aria-label="Remove rhythm"
                                >
                                    <X size={16} strokeWidth={1.5} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
