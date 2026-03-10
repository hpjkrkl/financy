import { useKanso } from '../context/KansoContext';

export default function Sidebar({ activeTab, setActiveTab, onOpenArchive }) {
    const { isDark, toggleDark } = useKanso();

    const navItems = [
        { key: 'overview', label: 'Overview' },
        { key: 'transactions', label: 'Transactions' },
        { key: 'banks', label: 'Banks' },
        { key: 'tabungs', label: 'Tabungs' },
        { key: 'recurring', label: 'Recurring' },
        { key: 'receipts', label: 'Receipts' },
        { key: 'wishlist', label: 'Wishlist' },
        { key: 'settings', label: 'Settings' },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 border-r border-sand justify-between p-10 z-20 bg-paper">
            <div>
                {/* Brand */}
                <div className="font-medium tracking-[0.2em] text-xs text-ink mb-16 select-none">
                    KANSO.
                </div>

                {/* Navigation */}
                <nav className="space-y-8">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveTab(item.key)}
                            className={`block text-sm tracking-widest relative transition-colors duration-300 cursor-pointer ${activeTab === item.key
                                ? 'text-ink'
                                : 'text-ink-light hover:text-ink'
                                } active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper`}
                        >
                            {/* Active dot indicator */}
                            {activeTab === item.key && (
                                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-ink animate-fade-in" />
                            )}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Archive Button */}
                <button
                    onClick={onOpenArchive}
                    className="mt-12 block text-sm tracking-widest text-stone hover:text-ink transition-colors duration-300 cursor-pointer active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                    Zen Archive
                </button>
            </div>

            {/* Footer: Version + Dark Mode Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-xs tracking-widest text-stone">V 1.1.0</p>
                <button
                    onClick={toggleDark}
                    aria-label="Toggle Midnight Zen"
                    className="text-xs tracking-widest text-stone hover:text-ink transition-colors duration-300 cursor-pointer active:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/20 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                >
                    {isDark ? 'LIGHT' : 'DARK'}
                </button>
            </div>
        </aside>
    );
}
