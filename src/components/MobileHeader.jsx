import { useState } from 'react';
import { useKanso } from '../context/KansoContext';

export default function MobileHeader({ activeTab, setActiveTab, onOpenArchive }) {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark, toggleDark } = useKanso();

    const navItems = [
        { key: 'overview', label: 'Overview' },
        { key: 'banks', label: 'Banks' },
        { key: 'tabungs', label: 'Tabungs' },
        { key: 'recurring', label: 'Recurring' },
        { key: 'receipts', label: 'Receipts' },
        { key: 'wishlist', label: 'Wishlist' },
        { key: 'settings', label: 'Settings' },
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
                        className="text-xs tracking-widest text-stone hover:text-ink transition-colors duration-300 cursor-pointer active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                    >
                        {isDark ? 'LIGHT' : 'DARK'}
                    </button>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-xs tracking-widest text-ink transition-colors duration-300 cursor-pointer active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? 'CLOSE' : 'MENU'}
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
                                    } active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper`}
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
                            className="text-left text-sm tracking-widest transition-colors duration-300 cursor-pointer text-stone hover:text-ink active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                        >
                            Zen Archive
                        </button>
                    </div>
                </>
            )}
        </header>
    );
}
