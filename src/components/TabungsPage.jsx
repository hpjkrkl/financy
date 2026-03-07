import { useState } from 'react';
import { Plus, Target, TrendingUp, TreeDeciduous, List } from 'lucide-react';
import { useKanso } from '../context/KansoContext';
import TabungTreeVisualization from './TabungTreeVisualization';

export default function TabungsPage() {
    const { banks, tabungs, setTabungs } = useKanso();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTabungName, setNewTabungName] = useState('');
    const [selectedBankId, setSelectedBankId] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newPurpose, setNewPurpose] = useState('');
    const [expandedTabungId, setExpandedTabungId] = useState(null);
    const [highlightedTabungId, setHighlightedTabungId] = useState(null);
    const [activeTabungId, setActiveTabungId] = useState(null);
    const [viewMode, setViewMode] = useState('list');

    const colors = ['#8BA888', '#D4A574', '#A8B4A5', '#C9B896', '#9CAF88'];

    const handleAddTabung = (e) => {
        e.preventDefault();
        if (!newTabungName || !selectedBankId || !newTarget) return;

        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newTabung = {
            id: Date.now(),
            name: newTabungName,
            bankId: Number(selectedBankId),
            target: parseFloat(newTarget),
            current: 0,
            purpose: newPurpose || 'Savings',
            color: randomColor
        };

        setTabungs([...tabungs, newTabung]);
        setNewTabungName('');
        setSelectedBankId('');
        setNewTarget('');
        setNewPurpose('');
        setShowAddForm(false);
    };

    const handleContribute = (tabungId, amount) => {
        const tabung = tabungs.find(t => t.id === tabungId);
        if (!tabung) return;

        setHighlightedTabungId(tabungId);
        setTabungs(tabungs.map(t => 
            t.id === tabungId 
                ? { ...t, current: t.current + amount }
                : t
        ));

        setTimeout(() => setHighlightedTabungId(null), 800);
    };

    const handleWithdraw = (tabungId, amount) => {
        const tabung = tabungs.find(t => t.id === tabungId);
        if (!tabung) return;

        setTabungs(tabungs.map(t => 
            t.id === tabungId 
                ? { ...t, current: Math.max(0, t.current - amount) }
                : t
        ));

        setHighlightedTabungId(tabungId);
        setTimeout(() => setHighlightedTabungId(null), 500);
    };

    const handleAddBreakdown = (tabungId, description, amount) => {
        const tabung = tabungs.find(t => t.id === tabungId);
        if (!tabung) return;

        const generateId = () => Date.now();
        const getCurrentDate = () => new Date().toISOString().split('T')[0];

        const newBreakdown = {
            id: generateId(),
            description,
            amount,
            date: getCurrentDate()
        };

        setTabungs(tabungs.map(t => 
            t.id === tabungId 
                ? { 
                    ...t, 
                    breakdowns: [...(t.breakdowns || []), newBreakdown],
                    current: t.current - amount
                  }
                : t
        ));
    };

    const handleRemoveBreakdown = (tabungId, breakdownId) => {
        const tabung = tabungs.find(t => t.id === tabungId);
        if (!tabung) return;

        const breakdown = tabung.breakdowns?.find(b => b.id === breakdownId);
        if (!breakdown) return;

        setTabungs(tabungs.map(t => 
            t.id === tabungId 
                ? { 
                    ...t, 
                    breakdowns: t.breakdowns.filter(b => b.id !== breakdownId),
                    current: t.current + breakdown.amount
                  }
                : t
        ));
    };

    const getProgress = (current, target) => {
        if (!target || target === 0) return current > 0 ? 100 : 0;
        return Math.min((current / target) * 100, 100);
    };

    return (
        <div className="animate-fade-in space-y-16">
            <section>
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink mb-4">
                    Tabungs
                </h1>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Track your savings goals and liquidity buckets within each bank.
                </p>

                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-3 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                >
                    <Plus size={18} strokeWidth={1.5} />
                    Add Tabung
                </button>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 border text-sm uppercase tracking-widest transition-all duration-300 ${
                            viewMode === 'list' 
                                ? 'border-sage bg-sage text-white' 
                                : 'border-sand hover:border-ink'
                        }`}
                    >
                        <List size={16} strokeWidth={1.5} />
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('tree')}
                        className={`flex items-center gap-2 px-4 py-2 border text-sm uppercase tracking-widest transition-all duration-300 ${
                            viewMode === 'tree' 
                                ? 'border-sage bg-sage text-white' 
                                : 'border-sand hover:border-ink'
                        }`}
                    >
                        <TreeDeciduous size={16} strokeWidth={1.5} />
                        Tree View
                    </button>
                </div>
            </section>

            {/* Add Tabung Form */}
            {showAddForm && (
                <section className="bg-paper border border-sand p-6 md:p-8 animate-fade-in">
                    <form onSubmit={handleAddTabung} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Tabung Name</label>
                                <input
                                    type="text"
                                    value={newTabungName}
                                    onChange={(e) => setNewTabungName(e.target.value)}
                                    placeholder="e.g. Emergency Fund"
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Bank</label>
                                <select
                                    value={selectedBankId}
                                    onChange={(e) => setSelectedBankId(e.target.value)}
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                                >
                                    <option value="">Select bank</option>
                                    {banks.map(bank => (
                                        <option key={bank.id} value={bank.id}>{bank.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Target Amount (RM)</label>
                                <input
                                    type="number"
                                    value={newTarget}
                                    onChange={(e) => setNewTarget(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Purpose</label>
                                <input
                                    type="text"
                                    value={newPurpose}
                                    onChange={(e) => setNewPurpose(e.target.value)}
                                    placeholder="e.g. Rainy days"
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="h-12 px-6 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newTabungName || !selectedBankId || !newTarget}
                                className="h-12 px-6 border border-sage bg-sage text-white hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                            >
                                Create Tabung
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Tabungs Display */}
            <section className="space-y-6">
                {viewMode === 'tree' ? (
                    <div className="bg-paper border border-sand p-6 md:p-8 animate-fade-in">
                        <h2 className="text-2xl font-serif text-ink mb-6">Savings Tree</h2>
                        <TabungTreeVisualization />
                    </div>
                ) : (
                    <>
                        {tabungs.length === 0 ? (
                            <div className="text-center py-20 border border-sand/50 text-stone text-sm italic">
                                No tabungs created yet. Create your first tabung to start tracking your savings goals.
                            </div>
                        ) : (
                            tabungs.map((tabung, idx) => {
                                const progress = getProgress(tabung.current, tabung.target);
                                const remaining = tabung.target - tabung.current;
                                const isComplete = progress >= 100;
                                const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;

                                return (
                                    <div
                                        key={tabung.id}
                                        onClick={() => setActiveTabungId(activeTabungId === tabung.id ? null : tabung.id)}
                                        className={`border ${isComplete ? 'border-sage/50 bg-sage/5' : 'border-sand'} p-6 md:p-8 animate-slide-up-slow ${staggerClass} transition-all duration-300 cursor-pointer hover:border-sand ${
                                            highlightedTabungId === tabung.id 
                                                ? 'border-sage/60 bg-sage/15 scale-[1.02] shadow-[0_4px_20px_rgba(139,165,136,0.3)]' 
                                                : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-start gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: tabung.color + '20' }}
                                                >
                                                    <Target size={20} strokeWidth={1.5} style={{ color: tabung.color }} />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl md:text-4xl font-serif text-ink tabular-nums transition-all duration-500">
                                                    RM{tabung.current.toLocaleString()}
                                                </p>
                                                <p className="text-xs text-ink-light uppercase tracking-widest mt-1">
                                                    of RM{tabung.target.toLocaleString()} target
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-6">
                                            <div className="h-2 bg-sand rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        highlightedTabungId === tabung.id 
                                                            ? 'scale-y-125 shadow-[0_0_12px_rgba(0,0,0,0.3)]' 
                                                            : ''
                                                    }`}
                                                    style={{
                                                        width: `${progress}%`,
                                                        backgroundColor: tabung.color
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2">
                                                <p className="text-xs text-stone uppercase tracking-widest">
                                                    {progress.toFixed(0)}% Complete
                                                </p>
                                                {!isComplete && (
                                                    <p className="text-xs text-ink-light">
                                                        RM{remaining.toLocaleString()} remaining
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quick Actions - Only show when active */}
                                        {activeTabungId === tabung.id && (
                                            <div className="space-y-4 pt-4 border-t border-sand animate-fade-in">
                                                <div className="flex gap-3 flex-wrap">
                                                    {[100, 200, 500, 1000].map(amount => (
                                                        <button
                                                            key={`add-${amount}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleContribute(tabung.id, amount);
                                                            }}
                                                            className="px-4 py-2 text-xs uppercase tracking-widest border border-sand hover:border-sage hover:bg-sage/10 transition-all duration-300"
                                                        >
                                                            +RM{amount}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const customAmount = prompt('Enter amount to add:');
                                                            if (customAmount) {
                                                                handleContribute(tabung.id, parseFloat(customAmount));
                                                            }
                                                        }}
                                                        className="px-4 py-2 text-xs uppercase tracking-widest border border-sand hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300"
                                                    >
                                                        Custom Add
                                                    </button>
                                                </div>

                                                <div className="flex gap-3 flex-wrap">
                                                    {[100, 200, 500, 1000].map(amount => (
                                                        <button
                                                            key={`withdraw-${amount}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                tabung.current >= amount && handleWithdraw(tabung.id, amount);
                                                            }}
                                                            disabled={tabung.current < amount}
                                                            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-300 ${
                                                                tabung.current >= amount 
                                                                    ? 'border-sand hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' 
                                                                    : 'border-sand/30 text-stone cursor-not-allowed'
                                                            }`}
                                                        >
                                                            -RM{amount}
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const customAmount = prompt('Enter amount to withdraw:');
                                                            if (customAmount && parseFloat(customAmount) <= tabung.current) {
                                                                handleWithdraw(tabung.id, parseFloat(customAmount));
                                                            }
                                                        }}
                                                        className="px-4 py-2 text-xs uppercase tracking-widest border border-sand hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                                                    >
                                                        Custom Withdraw
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Expand/Collapse Breakdown */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedTabungId(expandedTabungId === tabung.id ? null : tabung.id);
                                            }}
                                            className="mt-4 text-xs uppercase tracking-widest text-ink-light hover:text-ink transition-colors flex items-center gap-2"
                                        >
                                            {expandedTabungId === tabung.id ? '▼' : '▶'} 
                                            {expandedTabungId === tabung.id ? 'Hide Breakdown' : 'Show Breakdown'}
                                        </button>

                                        {/* Breakdown Section */}
                                        {expandedTabungId === tabung.id && (
                                            <div className="mt-6 pt-6 border-t border-sand animate-fade-in">
                                                <h4 className="text-sm uppercase tracking-widest text-ink-light mb-4">Breakdown</h4>

                                                {tabung.breakdowns && tabung.breakdowns.length > 0 ? (
                                                    <div className="space-y-3 mb-6">
                                                        {tabung.breakdowns.map((breakdown) => (
                                                            <div key={breakdown.id} className="flex justify-between items-center text-sm">
                                                                <div className="flex-1">
                                                                    <p className="text-ink">{breakdown.description}</p>
                                                                    <p className="text-xs text-stone">{breakdown.date}</p>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-ink">RM{breakdown.amount.toLocaleString()}</span>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRemoveBreakdown(tabung.id, breakdown.id);
                                                                        }}
                                                                        className="text-xs text-stone hover:text-red-400 transition-colors"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-stone italic mb-4">No breakdown entries yet.</p>
                                                )}

                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        id={`breakdown-desc-${tabung.id}`}
                                                        placeholder="Description"
                                                        className="flex-1 px-3 py-2 text-sm border border-sand focus:border-ink outline-none bg-transparent"
                                                    />
                                                    <input
                                                        type="number"
                                                        id={`breakdown-amount-${tabung.id}`}
                                                        placeholder="Amount"
                                                        className="w-24 px-3 py-2 text-sm border border-sand focus:border-ink outline-none bg-transparent"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const desc = document.getElementById(`breakdown-desc-${tabung.id}`).value;
                                                            const amt = parseFloat(document.getElementById(`breakdown-amount-${tabung.id}`).value);
                                                            if (desc && amt && amt <= tabung.current) {
                                                                handleAddBreakdown(tabung.id, desc, amt);
                                                                document.getElementById(`breakdown-desc-${tabung.id}`).value = '';
                                                                document.getElementById(`breakdown-amount-${tabung.id}`).value = '';
                                                            }
                                                        }}
                                                        className="px-4 py-2 text-xs uppercase tracking-widest border border-sage bg-sage text-white hover:opacity-80 transition-all duration-300"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {isComplete && (
                                            <div className="flex items-center gap-2 text-sage mt-4">
                                                <TrendingUp size={16} strokeWidth={1.5} />
                                                <p className="text-sm font-medium">Target achieved!</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </>
                    )}
                </section>
        </div>
    );
}
