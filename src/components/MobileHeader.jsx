import { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function MobileHeader({ activeTab, setActiveTab, onOpenArchive }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark, toggleDark } = useKanso();

    const navItems = [
        { key: 'overview', label: 'Overview' },
        { key: 'insights', label: 'Insights' },
        { key: 'vessels', label: 'Vessels' },
        { key: 'rhythms', label: 'Rhythms' },
        { key: 'patience', label: 'Patience Queue' },
    ];

    return (
        <header className="md:hidden relative z-50">
            {/* Top bar */}
            <div className="flex justify-between items-center px-4 py-5 border-b border-sand bg-paper relative z-10">
                <div className="font-medium tracking-[0.2em] text-xs text-ink select-none">
                    KANSO.
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDark}
                        aria-label="Toggle Midnight Zen"
                        className="text-stone hover:text-ink transition-colors duration-300 cursor-pointer"
                    >
                        {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-ink transition-transform duration-300 cursor-pointer"
                        style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Dropdown overlay & Backdrop */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-paper/50 backdrop-blur-sm z-0"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu panel */}
                    <div className="absolute top-full left-0 w-full bg-paper border-b border-sand z-10 px-4 py-6 flex flex-col gap-6 shadow-xl shadow-black/5 animate-fade-in">
                        {navItems.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => {
                                    setActiveTab(item.key);
                                    setIsOpen(false);
                                }}
                                className={`text-left text-sm tracking-widest transition-colors duration-300 cursor-pointer ${activeTab === item.key
                                    ? 'text-ink font-medium'
                                    : 'text-ink-light'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}

                        <hr className="border-t border-sand" />

                        <button
                            onClick={() => {
                                onOpenArchive();
                                setIsOpen(false);
                            }}
                            className="text-left text-sm tracking-widest transition-colors duration-300 cursor-pointer text-stone hover:text-ink"
                        >
                            Zen Archive
                        </button>
                    </div>
                </>
            )}
        </header>
    );
}
