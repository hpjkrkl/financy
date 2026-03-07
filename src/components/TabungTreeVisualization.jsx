import { useKanso } from '../context/KansoContext';

export default function TabungTreeVisualization() {
    const { banks, tabungs } = useKanso();

    if (banks.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 border border-sand/50 text-stone text-sm italic">
                Add banks to see your savings tree grow
            </div>
        );
    }

    const totalBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
    const maxBankBalance = Math.max(...banks.map(b => b.balance), 1);

    const treeHeight = 400;
    const treeWidth = Math.max(800, banks.length * 250);

    const calculateNodeSize = (balance, maxBalance) => {
        const minSize = 40;
        const maxSize = 100;
        const ratio = balance / maxBalance;
        return minSize + (maxSize - minSize) * ratio;
    };

    const generateBranchPath = (startX, startY, endX, endY, seed, curveIntensity = 0.5) => {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const pseudoRandom = (n) => {
            const x = Math.sin(n) * 10000;
            return x - Math.floor(x);
        };
        const controlX = midX + (pseudoRandom(seed) - 0.5) * 50 * curveIntensity;
        const controlY = midY + (pseudoRandom(seed + 1) - 0.5) * 50 * curveIntensity;
        
        return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
    };

    const trunkWidth = 30 + Math.min(totalBalance / 10000, 70);

    return (
        <div className="w-full overflow-x-auto">
            <svg 
                viewBox={`0 0 ${treeWidth} ${treeHeight}`} 
                className="w-full h-auto"
                style={{ minHeight: '400px' }}
            >
                <defs>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.2"/>
                    </filter>
                    <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B7355"/>
                        <stop offset="50%" stopColor="#A0876A"/>
                        <stop offset="100%" stopColor="#8B7355"/>
                    </linearGradient>
                    <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8BA888"/>
                        <stop offset="100%" stopColor="#6B8A68"/>
                    </linearGradient>
                </defs>

                <rect 
                    x="0" 
                    y={treeHeight - 40} 
                    width={treeWidth} 
                    height="40" 
                    fill="url(#groundGradient)" 
                    opacity="0.3"
                />

                <path
                    d={`M ${treeWidth/2 - trunkWidth/2} ${treeHeight - 40} 
                        L ${treeWidth/2 - trunkWidth/3} ${treeHeight - 200}
                        L ${treeWidth/2 + trunkWidth/3} ${treeHeight - 200}
                        L ${treeWidth/2 + trunkWidth/2} ${treeHeight - 40}`}
                    fill="url(#trunkGradient)"
                    filter="url(#shadow)"
                />

                <path
                    d={`M ${treeWidth/2 - trunkWidth/2} ${treeHeight - 40} 
                        L ${treeWidth/2 - trunkWidth/3} ${treeHeight - 200}
                        L ${treeWidth/2 + trunkWidth/3} ${treeHeight - 200}
                        L ${treeWidth/2 + trunkWidth/2} ${treeHeight - 40} Z`}
                    fill="none"
                    stroke="#6B5535"
                    strokeWidth="1"
                />

                {banks.map((bank, bankIndex) => {
                    const bankTabungs = tabungs.filter(t => t.bankId === bank.id);
                    const bankX = banks.length === 1 
                        ? treeWidth / 2 
                        : 100 + bankIndex * (treeWidth - 200) / Math.max(banks.length - 1, 1);
                    const bankY = treeHeight - 220;
                    const bankSize = calculateNodeSize(bank.balance, maxBankBalance);

                    return (
                        <g key={bank.id}>
                            <path
                                d={generateBranchPath(
                                    treeWidth/2, 
                                    treeHeight - 200, 
                                    bankX, 
                                    bankY,
                                    bank.id,
                                    0.3
                                )}
                                stroke="#8B7355"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                            />

                            <circle
                                cx={bankX}
                                cy={bankY}
                                r={bankSize}
                                fill="#A8B4A5"
                                filter="url(#shadow)"
                                className="cursor-pointer hover:opacity-90 transition-opacity"
                            />

                            <text
                                x={bankX}
                                y={bankY - bankSize - 10}
                                textAnchor="middle"
                                className="text-xs font-medium fill-ink"
                                style={{ fontSize: '12px', fontWeight: '600' }}
                            >
                                {bank.name}
                            </text>

                            <text
                                x={bankX}
                                y={bankY + 5}
                                textAnchor="middle"
                                className="text-xs fill-ink"
                                style={{ fontSize: '11px' }}
                            >
                                RM{bank.balance.toLocaleString()}
                            </text>

                            {bankTabungs.map((tabung, tabungIndex) => {
                                const angle = (tabungIndex - (bankTabungs.length - 1) / 2) * 30;
                                const distance = bankSize + 40 + tabungIndex * 20;
                                const tabungX = bankX + Math.sin(angle * Math.PI / 180) * distance;
                                const tabungY = bankY - Math.cos(angle * Math.PI / 180) * distance;
                                const tabungSize = 20 + (tabung.current / tabung.target) * 30;
                                const isComplete = tabung.current >= tabung.target;

                                return (
                                    <g key={tabung.id}>
                                        <path
                                            d={generateBranchPath(
                                                bankX, 
                                                bankY - bankSize, 
                                                tabungX, 
                                                tabungY,
                                                tabung.id,
                                                0.2
                                            )}
                                            stroke="#A8B4A5"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray="4,2"
                                        />

                                        <circle
                                            cx={tabungX}
                                            cy={tabungY}
                                            r={tabungSize}
                                            fill={isComplete ? '#8BA888' : tabung.color}
                                            opacity="0.8"
                                            filter="url(#shadow)"
                                            className="cursor-pointer hover:opacity-100 transition-opacity"
                                        />

                                        <text
                                            x={tabungX}
                                            y={tabungY + tabungSize + 15}
                                            textAnchor="middle"
                                            className="text-xs fill-ink"
                                            style={{ fontSize: '10px' }}
                                        >
                                            {tabung.name}
                                        </text>

                                        <text
                                            x={tabungX}
                                            y={tabungY + 4}
                                            textAnchor="middle"
                                            className="text-xs fill-white"
                                            style={{ fontSize: '9px', fontWeight: 'bold' }}
                                        >
                                            {Math.round((tabung.current / tabung.target) * 100)}%
                                        </text>
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}

                <text
                    x={treeWidth/2}
                    y={treeHeight - 20}
                    textAnchor="middle"
                    className="text-sm fill-ink"
                    style={{ fontSize: '14px', fontStyle: 'italic' }}
                >
                    Total Balance: RM{totalBalance.toLocaleString()}
                </text>
            </svg>
        </div>
    );
}