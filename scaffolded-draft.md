import React, { useState, useMemo } from 'react';
import { Menu, Plus, ArrowRight, TrendingDown, TrendingUp, Circle } from 'lucide-react';

// Kanso Theme Colors
const theme = {
paper: '#FAFAF8',
ink: '#2C2C2A',
inkLight: '#6E6E6A',
sage: '#8BA888',
sand: '#E8E5DF',
stone: '#D1D0C9'
};

const initialTransactions = [
{ id: 1, type: 'expense', amount: 14.50, merchant: 'Matcha Teahouse', category: 'Dining', date: 'Today' },
{ id: 2, type: 'expense', amount: 32.00, merchant: 'Kinokuniya Books', category: 'Education', date: 'Today' },
{ id: 3, type: 'income', amount: 850.00, merchant: 'Client Invoice #042', category: 'Freelance', date: 'Yesterday' },
{ id: 4, type: 'expense', amount: 120.00, merchant: 'Farmers Market', category: 'Groceries', date: 'Yesterday' },
{ id: 5, type: 'expense', amount: 45.00, merchant: 'Ceramics Class', category: 'Education', date: 'Oct 12' },
];

export default function App() {
const [activeTab, setActiveTab] = useState('overview');
const [chartStyle, setChartStyle] = useState('line');
const [transactions, setTransactions] = useState(initialTransactions);
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Form State
const [type, setType] = useState('expense');
const [amount, setAmount] = useState('');
const [merchant, setMerchant] = useState('');
const [category, setCategory] = useState('');
const [isReflecting, setIsReflecting] = useState(false);

// Derived State
const balance = useMemo(() => {
return transactions.reduce((acc, curr) => {
return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
}, 4000); // Starting base balance for effect
}, [transactions]);

const categoryTotals = useMemo(() => {
const expenses = transactions.filter(t => t.type === 'expense');
const totals = expenses.reduce((acc, curr) => {
acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
return acc;
}, {});

// Sort descending
return Object.entries(totals)
.sort(([, a], [, b]) => b - a)
.map(([name, total]) => ({ name, total }));
}, [transactions]);

const totalExpenses = useMemo(() => categoryTotals.reduce((sum, cat) => sum + cat.total, 0), [categoryTotals]);

const handleAddTransaction = (e) => {
if (e) e.preventDefault();
if (!amount || !merchant || !category) return;

const newTx = {
id: Date.now(),
type,
amount: parseFloat(amount),
merchant,
category,
date: 'Just now'
};

setTransactions([newTx, ...transactions]);
setAmount('');
setMerchant('');
setCategory('');
setIsReflecting(false); // Reset reflection state
};

return (
<div className="min-h-screen flex selection:bg-[#2C2C2A] selection:text-[#FAFAF8]" style={{ backgroundColor:
    theme.paper, color: theme.ink, fontFamily: "'Inter', sans-serif" }}>
    {/* Inject Fonts */}
    <style>
        {
            ` @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@200;300;400;500&display=swap');

            .font-serif {
                font-family: 'Cormorant Garamond', serif;
            }

            .kanso-input {
                background: transparent;
                border: none;

                border-bottom: 1px solid $ {
                    theme.sand
                }

                ;
                border-radius: 0;
                padding: 0.5rem 0;

                color: $ {
                    theme.ink
                }

                ;
                transition: border-color 0.3s ease;
            }

            .kanso-input:focus {
                outline: none;

                border-bottom-color: $ {
                    theme.ink
                }

                ;
            }

            .kanso-input::placeholder {
                color: $ {
                    theme.stone
                }

                ;
                font-weight: 300;
            }

            ::-webkit-scrollbar {
                width: 0px;
                background: transparent;
            }

            `
        }
    </style>

    {/* Sidebar Desktop */}
    <aside className="hidden md:flex flex-col w-64 border-r justify-between p-10 z-20" style={{ borderColor: theme.sand,
        backgroundColor: theme.paper }}>
        <div>
            <div className="font-medium tracking-[0.2em] text-xs mb-16" style={{ color: theme.ink }}>KANSO.</div>
            <nav className="space-y-8">
                <button onClick={()=> setActiveTab('overview')} className={`block text-sm tracking-widest relative group
                    transition-colors ${activeTab === 'overview' ? 'text-[#2C2C2A]' : 'text-[#6E6E6A]
                    hover:text-[#2C2C2A]'}`}>
                    {activeTab === 'overview' && <span
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{
                        backgroundColor: theme.ink }}></span>}
                    Overview
                </button>
                <button onClick={()=> setActiveTab('insights')} className={`block text-sm tracking-widest relative group
                    transition-colors ${activeTab === 'insights' ? 'text-[#2C2C2A]' : 'text-[#6E6E6A]
                    hover:text-[#2C2C2A]'}`}>
                    {activeTab === 'insights' && <span
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full" style={{
                        backgroundColor: theme.ink }}></span>}
                    Insights
                </button>
            </nav>
        </div>
        <div className="space-y-6">
            <p className="text-xs tracking-widest" style={{ color: theme.stone }}>V 1.0.2</p>
        </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">

        {/* Mobile Header */}
        <header className="md:hidden flex justify-between items-center p-6 border-b" style={{ borderColor: theme.sand
            }}>
            <div className="font-medium tracking-[0.2em] text-xs" style={{ color: theme.ink }}>KANSO.</div>
            <button onClick={()=> setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu size={24} style={{ color: theme.ink }} />
            </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
        <div
            className="md:hidden absolute top-20 left-0 w-full bg-[#FAFAF8] border-b border-[#E8E5DF] z-50 p-6 flex flex-col gap-6 shadow-xl shadow-black/5">
            <button onClick={()=> { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`text-left
                text-sm tracking-widest ${activeTab === 'overview' ? 'text-[#2C2C2A] font-medium' :
                'text-[#6E6E6A]'}`}>Overview</button>
            <button onClick={()=> { setActiveTab('insights'); setIsMobileMenuOpen(false); }} className={`text-left
                text-sm tracking-widest ${activeTab === 'insights' ? 'text-[#2C2C2A] font-medium' :
                'text-[#6E6E6A]'}`}>Insights</button>
        </div>
        )}

        <div className="max-w-4xl w-full mx-auto px-6 py-12 md:py-20 flex-1">

            {activeTab === 'overview' ? (
            <div className="animate-[fade-in_0.5s_ease-out]">
                {/* Greeting & Balance */}
                <section className="mb-20">
                    <p className="tracking-widest text-xs uppercase mb-4" style={{ color: theme.inkLight }}>Current
                        Balance</p>
                    <h1 className="font-serif text-6xl md:text-8xl tracking-tight transition-all duration-500" style={{
                        color: theme.ink }}>
                        ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <p className="mt-4 text-sm font-light" style={{ color: theme.inkLight }}>Available across all
                        accounts.</p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* Narrative Entry Form & Mindful Pause */}
                    <section className="lg:col-span-5">
                        <div className="flex justify-between items-end border-b pb-4 mb-10" style={{ borderColor:
                            theme.sand }}>
                            <h2 className="font-serif text-2xl" style={{ color: theme.ink }}>{isReflecting ?
                                'Reflection' : 'Journal'}</h2>
                        </div>

                        <div className="min-h-[300px] flex flex-col justify-center">
                            {!isReflecting ? (
                            <form onSubmit={(e)=> { e.preventDefault(); if(amount && merchant && category)
                                setIsReflecting(true); }} className="animate-[fade-in_0.5s_ease-out]">

                                {/* Narrative Sentence Input */}
                                <div className="font-serif text-2xl md:text-3xl leading-[2] md:leading-[2]" style={{
                                    color: theme.inkLight }}>
                                    "I am recording an

                                    <button type="button" onClick={()=> setType(type === 'expense' ? 'income' :
                                        'expense')}
                                        className="inline-block mx-2 pb-1 border-b hover:opacity-70 transition-opacity
                                        focus:outline-none"
                                        style={{ color: theme.ink, borderColor: theme.ink }}
                                        >
                                        {type}
                                    </button>

                                    of <span style={{ color: theme.ink }}>$</span>

                                    <input type="number" value={amount} onChange={(e)=> setAmount(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                    className="w-24 inline-block bg-transparent border-b text-center mx-2 pb-1
                                    focus:outline-none placeholder:font-light transition-colors"
                                    style={{ color: theme.ink, borderColor: theme.sand }}
                                    onFocus={(e) => e.target.style.borderColor = theme.ink}
                                    onBlur={(e) => e.target.style.borderColor = theme.sand}
                                    />

                                    at

                                    <input type="text" value={merchant} onChange={(e)=> setMerchant(e.target.value)}
                                    placeholder="merchant"
                                    required
                                    className="w-36 inline-block bg-transparent border-b text-center mx-2 pb-1
                                    focus:outline-none placeholder:font-light transition-colors"
                                    style={{ color: theme.ink, borderColor: theme.sand }}
                                    onFocus={(e) => e.target.style.borderColor = theme.ink}
                                    onBlur={(e) => e.target.style.borderColor = theme.sand}
                                    />

                                    for

                                    <input type="text" value={category} onChange={(e)=> setCategory(e.target.value)}
                                    placeholder="category"
                                    required
                                    className="w-32 inline-block bg-transparent border-b text-center mx-2 pb-1
                                    focus:outline-none placeholder:font-light transition-colors"
                                    style={{ color: theme.ink, borderColor: theme.sand }}
                                    onFocus={(e) => e.target.style.borderColor = theme.ink}
                                    onBlur={(e) => e.target.style.borderColor = theme.sand}
                                    />."
                                </div>

                                <button type="submit"
                                    className="mt-12 px-8 py-3 border rounded-full text-xs tracking-[0.2em] uppercase transition-colors duration-300 hover:text-[#FAFAF8]"
                                    style={{ borderColor: theme.sand, color: theme.ink }} onMouseEnter={(e)=>
                                    e.target.style.backgroundColor = theme.ink} onMouseLeave={(e) =>
                                    e.target.style.backgroundColor = 'transparent'}>
                                    Reflect
                                </button>
                            </form>
                            ) : (
                            /* The Mindful Pause Screen */
                            <div
                                className="animate-[fade-in_0.5s_ease-out] flex flex-col items-center text-center py-6">
                                <Circle size={32} strokeWidth={1} className="mb-6 animate-pulse" style={{ color:
                                    theme.sage }} />
                                <h3 className="font-serif text-3xl mb-4" style={{ color: theme.ink }}>Mindful Pause</h3>

                                <p className="font-light leading-relaxed max-w-sm mb-10" style={{ color: theme.inkLight
                                    }}>
                                    {type === 'expense'
                                    ? `You are parting with $${parseFloat(amount).toFixed(2)} at ${merchant}. Take a
                                    breath. Does this align with your current intentions?`
                                    : `You are receiving $${parseFloat(amount).toFixed(2)} from ${merchant}. Take a
                                    moment to appreciate this inflow.`}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                    <button onClick={()=> setIsReflecting(false)} className="px-6 py-3 text-xs
                                        tracking-[0.2em] uppercase transition-colors" style={{ color: theme.inkLight }}
                                        onMouseEnter={(e) => e.target.style.color = theme.ink} onMouseLeave={(e) =>
                                        e.target.style.color = theme.inkLight}>
                                        Go Back
                                    </button>
                                    <button onClick={handleAddTransaction}
                                        className="px-8 py-3 text-xs tracking-[0.2em] uppercase rounded-full transition-opacity hover:opacity-80"
                                        style={{ backgroundColor: theme.ink, color: theme.paper }}>
                                        Record {type === 'expense' ? 'Outflow' : 'Inflow'}
                                    </button>
                                </div>
                            </div>
                            )}
                        </div>
                    </section>

                    {/* Ledger */}
                    <section className="lg:col-span-7">
                        <div className="flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor:
                            theme.sand }}>
                            <h2 className="font-serif text-2xl" style={{ color: theme.ink }}>Recent</h2>
                            <span className="text-xs tracking-widest cursor-pointer hover:opacity-70 transition-opacity"
                                style={{ color: theme.inkLight }}>View All</span>
                        </div>

                        <div className="space-y-6">
                            {transactions.map((tx, idx) => {
                            // Add a date header if it's the first item or date changed
                            const showDate = idx === 0 || tx.date !== transactions[idx - 1].date;

                            return (
                            <React.Fragment key={tx.id}>
                                {showDate && (
                                <div className="text-xs tracking-widest uppercase mt-8 mb-4" style={{ color: theme.stone
                                    }}>{tx.date}</div>
                                )}
                                <div
                                    className="flex justify-between items-center group animate-[slideDown_0.3s_ease-out]">
                                    <div className="flex flex-col">
                                        <span
                                            className="text-sm transition-transform duration-300 group-hover:translate-x-2"
                                            style={{ color: theme.ink }}>{tx.merchant}</span>
                                        <span className="text-xs mt-1" style={{ color: theme.inkLight
                                            }}>{tx.category}</span>
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: tx.type==='expense' ?
                                        theme.ink : theme.sage }}>
                                        {tx.type === 'expense' ? '-' : '+'} ${tx.amount.toFixed(2)}
                                    </span>
                                </div>
                            </React.Fragment>
                            );
                            })}
                        </div>
                    </section>
                </div>
            </div>
            ) : (
            /* INSIGHTS VIEW */
            <div className="animate-[fade-in_0.5s_ease-out]">
                <section className="mb-20">
                    <p className="tracking-widest text-xs uppercase mb-4" style={{ color: theme.inkLight }}>Mindful
                        Insights</p>
                    {categoryTotals.length > 0 ? (
                    <h1 className="font-serif text-4xl md:text-6xl leading-tight" style={{ color: theme.ink }}>
                        Your primary energy flowed towards <span className="italic opacity-70">{categoryTotals[0]?.name
                            || 'various things'}</span> this period.
                    </h1>
                    ) : (
                    <h1 className="font-serif text-4xl md:text-6xl leading-tight" style={{ color: theme.ink }}>
                        A quiet period. No outflow recorded yet.
                    </h1>
                    )}
                </section>

                {categoryTotals.length > 0 && (
                <div className="space-y-20">
                    {/* Chart Selection & Visualization */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-sm tracking-widest uppercase mb-1" style={{ color: theme.inkLight
                                    }}>Outflow Distribution</h2>
                                <span className="text-sm font-serif italic" style={{ color: theme.ink
                                    }}>${totalExpenses.toFixed(2)} total</span>
                            </div>

                            {/* Chart Style Toggles */}
                            <div className="flex gap-4">
                                <button onClick={()=> setChartStyle('line')} className={`text-[10px] tracking-widest
                                    uppercase transition-colors ${chartStyle === 'line' ? 'text-[#2C2C2A] border-b
                                    border-[#2C2C2A]' : 'text-[#6E6E6A] hover:text-[#2C2C2A]'}`}>Line</button>
                                <button onClick={()=> setChartStyle('ring')} className={`text-[10px] tracking-widest
                                    uppercase transition-colors ${chartStyle === 'ring' ? 'text-[#2C2C2A] border-b
                                    border-[#2C2C2A]' : 'text-[#6E6E6A] hover:text-[#2C2C2A]'}`}>Ring</button>
                                <button onClick={()=> setChartStyle('pebbles')} className={`text-[10px] tracking-widest
                                    uppercase transition-colors ${chartStyle === 'pebbles' ? 'text-[#2C2C2A] border-b
                                    border-[#2C2C2A]' : 'text-[#6E6E6A] hover:text-[#2C2C2A]'}`}>Pebbles</button>
                            </div>
                        </div>

                        <div className="mb-10 min-h-[160px] flex flex-col justify-center">
                            {/* 1. The Proportion Line (Original) */}
                            {chartStyle === 'line' && (
                            <div
                                className="w-full h-[2px] flex rounded-full overflow-hidden bg-[#E8E5DF] animate-[fade-in_0.5s_ease-out]">
                                {categoryTotals.map((cat, i) => {
                                const percent = (cat.total / totalExpenses) * 100;
                                const shades = ['#2C2C2A', '#6E6E6A', '#8BA888', '#C48B71', '#D1D0C9'];
                                return (
                                <div key={cat.name} style={{ width: `${percent}%`, backgroundColor: shades[i %
                                    shades.length] }} className="h-full transition-all duration-1000" />
                                );
                                })}
                            </div>
                            )}

                            {/* 2. The Zen Ring */}
                            {chartStyle === 'ring' && (
                            <div className="flex justify-center animate-[fade-in_0.5s_ease-out]">
                                <svg width="160" height="160" viewBox="0 0 100 100" className="-rotate-90">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke={theme.sand} strokeWidth="1" />
                                    {(() => {
                                    let currentOffset = 0;
                                    const circumference = 2 * Math.PI * 40;
                                    const shades = ['#2C2C2A', '#6E6E6A', '#8BA888', '#C48B71', '#D1D0C9'];
                                    return categoryTotals.map((cat, i) => {
                                    const percent = cat.total / totalExpenses;
                                    const strokeLength = percent * circumference;
                                    const gap = categoryTotals.length > 1 ? 1.5 : 0;
                                    const circle = (
                                    <circle key={cat.name} cx="50" cy="50" r="40" fill="none" stroke={shades[i %
                                        shades.length]} strokeWidth="3" strokeDasharray={`${Math.max(0, strokeLength -
                                        gap)} ${circumference}`} strokeDashoffset={-currentOffset}
                                        className="transition-all duration-1000 ease-out" />
                                    );
                                    currentOffset += strokeLength;
                                    return circle;
                                    });
                                    })()}
                                </svg>
                            </div>
                            )}

                            {/* 3. The Pebbles */}
                            {chartStyle === 'pebbles' && (
                            <div
                                className="flex flex-wrap items-center justify-center gap-4 animate-[fade-in_0.5s_ease-out]">
                                {categoryTotals.map((cat, i) => {
                                const percent = cat.total / totalExpenses;
                                const size = 40 + (percent * 80); // Dynamic sizing between 40px and 120px
                                const shades = ['#2C2C2A', '#6E6E6A', '#8BA888', '#C48B71', '#D1D0C9'];
                                return (
                                <div key={cat.name} style={{ width: size, height: size, backgroundColor: shades[i %
                                    shades.length] }}
                                    className="rounded-full flex flex-col items-center justify-center text-[#FAFAF8] shadow-sm transition-transform duration-500 hover:scale-105 cursor-default">
                                    {size > 50 && <span
                                        className="text-[10px] tracking-wider opacity-90">{cat.name}</span>}
                                </div>
                                );
                                })}
                            </div>
                            )}
                        </div>

                        {/* Legend text */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t" style={{ borderColor:
                            theme.sand }}>
                            {categoryTotals.map((cat, i) => {
                            const percent = ((cat.total / totalExpenses) * 100).toFixed(0);
                            const shades = ['#2C2C2A', '#6E6E6A', '#8BA888', '#C48B71', '#D1D0C9'];
                            return (
                            <div key={cat.name} className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs" style={{ color: theme.inkLight }}>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: shades[i %
                                        shades.length] }}></span>
                                    {cat.name}
                                </div>
                                <div className="font-serif text-lg" style={{ color: theme.ink }}>
                                    {percent}% <span
                                        className="text-sm font-sans ml-1 opacity-60">(${cat.total.toFixed(0)})</span>
                                </div>
                            </div>
                            );
                            })}
                        </div>
                    </section>

                    {/* Text-based Hybrid Insights */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="p-8 border rounded-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-500"
                            style={{ borderColor: theme.sand }}>
                            <TrendingUp className="mb-4" size={20} style={{ color: theme.inkLight }} />
                            <h3 className="font-serif text-xl mb-2" style={{ color: theme.ink }}>Intentional Spending
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: theme.inkLight }}>
                                You recorded <strong style={{ color: theme.ink
                                    }}>${categoryTotals[0]?.total.toFixed(2)}</strong> in {categoryTotals[0]?.name}.
                                This is your largest category, representing what holds your focus right now.
                            </p>
                        </div>
                        <div className="p-8 border rounded-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-500"
                            style={{ borderColor: theme.sand }}>
                            <TrendingDown className="mb-4" size={20} style={{ color: theme.sage }} />
                            <h3 className="font-serif text-xl mb-2" style={{ color: theme.ink }}>Gentle Savings</h3>
                            <p className="text-sm leading-relaxed" style={{ color: theme.inkLight }}>
                                Your recent freelance income brought a healthy inflow. You are currently maintaining a
                                mindful surplus, allowing your balance to breathe.
                            </p>
                        </div>
                    </section>
                </div>
                )}
            </div>
            )}

        </div>
    </main>

    {/* Tailwind Animations & utilities injected */}
    <style>
        {
            ` @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }

                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fade-in {
                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            `
        }
    </style>
</div>
);
}