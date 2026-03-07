import { ChevronDown } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function MonthSelector() {
    const { currentMonth, availableMonths, setCurrentMonth: onSelect, currentRealMonth } = useKanso();
    const formatMonth = (monthString) => {
        if (!monthString) return 'All Time';
        if (monthString === 'all') return 'All Time';
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="relative group inline-block">
            <button className="flex items-center space-x-2 text-ink hover:text-sage transition-colors text-sm tracking-widest uppercase">
                <span>{formatMonth(currentMonth)}</span>
                <ChevronDown size={14} className="opacity-50" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-48 bg-paper border border-sand rounded-md shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <ul className="py-2">
                    <li>
                        <button
                            className={`w-full text-left px-4 py-2 hover:bg-stone/10 transition-colors text-sm uppercase tracking-wider font-medium
                ${currentMonth === currentRealMonth ? 'text-sage' : 'text-ink-light'}
              `}
                            onClick={() => onSelect(currentRealMonth)}
                        >
                            This Month
                        </button>
                    </li>
                    <li>
                        <button
                            className={`w-full text-left px-4 py-2 hover:bg-stone/10 transition-colors text-sm uppercase tracking-wider
                ${currentMonth === 'all' ? 'text-sage' : 'text-ink-light'}
              `}
                            onClick={() => onSelect('all')}
                        >
                            All Time
                        </button>
                    </li>
                    {availableMonths.filter(m => m !== currentRealMonth).map((month) => (
                        <li key={month}>
                            <button
                                className={`w-full text-left px-4 py-2 hover:bg-stone/10 transition-colors text-sm uppercase tracking-wider
                  ${currentMonth === month ? 'text-sage' : 'text-ink-light'}
                `}
                                onClick={() => onSelect(month)}
                            >
                                {formatMonth(month)}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
