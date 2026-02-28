import { useMemo, useState, useEffect } from 'react';
import { Sankey, Tooltip, ResponsiveContainer, Layer } from 'recharts';
import { useKanso } from '../../context/KansoContext';

const CHART_SHADES = ['#8BA888', '#2C2C2A', '#D1D0C9', '#6E6E6A', '#C48B71'];

/* ─── Kanso Custom Sankey Node ────────────────── */
const KansoNode = ({ x, y, width, height, index, payload, containerWidth }) => {
    const isOut = x + width + 6 > containerWidth;
    return (
        <Layer key={`CustomNode${index}`}>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={payload.fill || '#2C2C2A'}
                fillOpacity="1"
                rx="2"
            />
            <text
                textAnchor={isOut ? 'end' : 'start'}
                x={isOut ? x - 8 : x + width + 8}
                y={y + height / 2}
                dy={4}
                fontSize="12"
                fontFamily="'Inter', sans-serif"
                fill="#6E6E6A"
                className="pointer-events-none select-none"
            >
                {payload.name}
            </text>
        </Layer>
    );
};

/* ─── Kanso Custom Sankey Link ────────────────── */
const KansoLink = ({
    sourceX,
    targetX,
    sourceY,
    targetY,
    sourceControlX,
    targetControlX,
    linkWidth,
    index,
    payload
}) => {
    const path = `
    M${sourceX},${sourceY}
    C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
  `;

    return (
        <Layer key={`CustomLink${index}`}>
            <path
                d={path}
                fill="none"
                stroke={payload.target.name === 'Period End Balance' ? '#8BA888' : '#E8E5DF'}
                strokeWidth={Math.max(linkWidth, 1)}
                strokeOpacity={0.6}
                className="transition-all duration-300 hover:stroke-[#D1D0C9] hover:stroke-opacity-80"
            />
        </Layer>
    );
};

export default function SankeyChart() {
    const { filteredTransactions: transactions, categoryTotals, startingBalanceForPeriod, totalExpenses } = useKanso();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const sankeyData = useMemo(() => {
        const totalIncome = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const periodEndingBalance = startingBalanceForPeriod + totalIncome - totalExpenses;

        const nodes = [
            { name: 'Starting Balance', fill: '#D1D0C9' },
            { name: 'Income', fill: '#8BA888' },
            { name: 'Available Funds', fill: '#2C2C2A' },
            { name: 'Period End Balance', fill: '#8BA888' },
            ...categoryTotals.map((cat, i) => ({
                name: cat.name,
                fill: CHART_SHADES[i % CHART_SHADES.length],
            })),
        ];

        const links = [];

        if (startingBalanceForPeriod > 0) {
            links.push({ source: 0, target: 2, value: startingBalanceForPeriod });
        }

        if (totalIncome > 0) {
            links.push({ source: 1, target: 2, value: totalIncome });
        }

        if (periodEndingBalance > 0) {
            links.push({ source: 2, target: 3, value: periodEndingBalance });
        }

        categoryTotals.forEach((cat, i) => {
            links.push({
                source: 2,
                target: 4 + i,
                value: cat.total,
            });
        });

        return { nodes, links };
    }, [transactions, categoryTotals, startingBalanceForPeriod, totalExpenses]);

    return (
        <div className="mb-10 h-[400px] w-full flex flex-col justify-center animate-fade-in">
            <ResponsiveContainer width="100%" height="100%">
                <Sankey
                    data={sankeyData}
                    nodePadding={40}
                    margin={{ left: 40, right: isMobile ? 80 : 120, top: 20, bottom: 20 }}
                    link={<KansoLink />}
                    node={<KansoNode />}
                >
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#FAFAF8',
                            border: '1px solid #E8E5DF',
                            borderRadius: '8px',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            color: '#2C2C2A',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                        }}
                        itemStyle={{ color: '#6E6E6A' }}
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                    />
                </Sankey>
            </ResponsiveContainer>
        </div>
    );
}
