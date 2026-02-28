import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import SankeyChart from './charts/SankeyChart';
import { useKanso } from '../context/KansoContext';

/* ─── Smart Flow Score Ring (SVG) ─────────────── */
function FlowScoreRing({ score }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const fill = circ - (circ * Math.min(Math.max(score, 0), 100)) / 100;
    const color = score >= 70 ? '#8BA888' : score >= 40 ? '#C48B71' : '#6E6E6A';
    const label = score >= 70 ? 'Flowing' : score >= 40 ? 'Mindful' : 'Unstable';
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-sand)" strokeWidth="6" />
                <circle
                    cx="50" cy="50" r={r}
                    fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={circ}
                    strokeDashoffset={fill}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <text x="50" y="54" textAnchor="middle" fontSize="18" fontFamily="Cormorant Garamond, serif" fill="var(--color-ink)">{score}</text>
            </svg>
            <span className="text-xs uppercase tracking-widest" style={{ color }}>{label}</span>
        </div>
    );
}

/* ─── Insight Cards ────────────────────────────── */
function InsightCards({ categoryTotals }) {
    const topCategory = categoryTotals[0];

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
            {/* Intentional Spending */}
            <div className="p-8 border border-sand rounded-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-500">
                <TrendingUp className="mb-4 text-ink-light" size={20} />
                <h3 className="font-serif text-xl mb-2 text-ink">Intentional Spending</h3>
                <p className="text-sm leading-relaxed text-ink-light">
                    You recorded{' '}
                    <strong className="text-ink">RM{topCategory?.total.toFixed(2)}</strong> in{' '}
                    {topCategory?.name}. This is your largest category, representing what holds your
                    focus right now.
                </p>
            </div>

            {/* Gentle Savings */}
            <div className="p-8 border border-sand rounded-lg hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-500">
                <TrendingDown className="mb-4 text-sage" size={20} />
                <h3 className="font-serif text-xl mb-2 text-ink">Gentle Savings</h3>
                <p className="text-sm leading-relaxed text-ink-light">
                    Your income flows gracefully into your balance. You are currently
                    maintaining a mindful surplus, allowing your accounts to breathe.
                </p>
            </div>
        </section>
    );
}

/* ─── Insights Page ────────────────────────────── */
export default function InsightsPage() {
    const {
        filteredTransactions: transactions,
        categoryTotals,
        totalExpenses,
        vessels,
        patienceQueue,
        balance,
        startingBalanceForPeriod
    } = useKanso();

    // ─── Smart Flow Score ──────────────────────────────
    const flowScore = useMemo(() => {
        let score = 50;
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
        if (savingsRate >= 0.2) score += 20;
        else if (savingsRate >= 0.1) score += 10;
        if (patienceQueue && patienceQueue.length > 0) score += 10;
        if (vessels && vessels.some(v => v.allocated > 0)) score += 10;
        if (totalExpenses > balance) score -= 10;
        return Math.min(100, Math.max(0, score));
    }, [transactions, totalExpenses, patienceQueue, vessels, balance]);

    // ─── Tea Time Poetry Calculation ────────────────
    const teaTimePoetry = useMemo(() => {
        if (!vessels || vessels.length === 0 || totalExpenses === 0) return "Your river is quiet. No energy has moved yet.";

        const vesselFlows = {};
        vessels.forEach(v => vesselFlows[v.name] = 0);

        transactions.forEach(t => {
            if (t.type === 'expense' && vesselFlows[t.category] !== undefined) {
                vesselFlows[t.category] += t.amount;
            }
        });

        const sortedVessels = Object.entries(vesselFlows).sort((a, b) => b[1] - a[1]);
        const highestVessel = sortedVessels[0][0];
        const lowestVessel = sortedVessels[sortedVessels.length - 1][0];

        if (sortedVessels[0][1] === 0) {
            return "Your vessels remain untouched, gathering potential for the days ahead.";
        }

        return `This cycle, your energy blossomed into ${highestVessel}, while ${lowestVessel} remained steady.`;
    }, [transactions, vessels, totalExpenses]);

    return (
        <div className="animate-fade-in">
            {/* ─── Tea Time ────────────────────────────────── */}
            <section className="mb-20 p-8 md:p-12 border border-[#8BA888]/30 bg-sage/5 relative overflow-hidden flex items-center justify-center min-h-[160px]">
                <div className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-[#8BA888]">
                    Tea Time Reflection
                </div>
                <p className="font-serif text-2xl md:text-3xl text-center text-ink italic leading-relaxed max-w-2xl px-4 animate-slide-up-slow">
                    &ldquo;{teaTimePoetry}&rdquo;
                </p>
            </section>

            {/* ─── Smart Flow Score ─────────────────────── */}
            <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center p-8 border border-sand">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-ink-light mb-2">Smart Flow Score</p>
                    <h2 className="font-serif text-3xl text-ink mb-3">Your financial mindfulness</h2>
                    <p className="text-sm font-light text-ink-light leading-relaxed">
                        A gentle 0–100 score reflecting your savings rate, patience discipline, vessel allocation, and overall flow. Not a grade — a mirror.
                    </p>
                    <ul className="mt-4 space-y-1 text-xs text-ink-light">
                        <li>+ Savings rate ≥ 20% <span className="text-sage">+20</span></li>
                        <li>+ Patience Queue in use <span className="text-sage">+10</span></li>
                        <li>+ Vessels allocated <span className="text-sage">+10</span></li>
                    </ul>
                </div>
                <div className="flex justify-center md:justify-end">
                    <FlowScoreRing score={flowScore} />
                </div>
            </section>

            {categoryTotals.length > 0 && (
                <div className="space-y-20">
                    {/* Chart Section */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h2 className="text-sm tracking-widest uppercase mb-1 text-ink-light">
                                    Energy Flow
                                </h2>
                                <span className="text-sm font-serif italic text-ink">
                                    ${totalExpenses.toFixed(2)} total outflow
                                </span>
                            </div>
                        </div>

                        {/* Sankey Chart visualization */}
                        <SankeyChart />
                    </section>

                    {/* Hybrid Insight Cards */}
                    <InsightCards categoryTotals={categoryTotals} />
                </div>
            )}
        </div>
    );
}
