import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';
import OverviewPage from './components/OverviewPage';
import BanksPage from './components/BanksPage';
import TabungsPage from './components/TabungsPage';
import RecurringPage from './components/RecurringPage';
import Wishlist from './components/Wishlist';
import ReceiptsPage from './components/ReceiptsPage';
import SettingsPage from './components/SettingsPage';
import Onboarding from './components/Onboarding';
import MonthSelector from './components/MonthSelector';
import ArchiveModal from './components/ArchiveModal';
import { KansoProvider, useKanso } from './context/KansoContext';

function InnerApp() {
    const { hasOnboarded, handleOnboardingComplete } = useKanso();

    // ─── UI / Routing State (these live here since they are pure UI) ────
    const [activeTab, setActiveTab] = useState('overview');
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);

    if (!hasOnboarded) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return (
        <div className="min-h-screen flex bg-paper text-ink font-sans">
            {/* Desktop Sidebar */}
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenArchive={() => setIsArchiveOpen(true)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative scroll-smooth">
                {/* Mobile Header */}
                <MobileHeader
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    onOpenArchive={() => setIsArchiveOpen(true)}
                />

                {/* Page Content */}
                <div className="max-w-4xl w-full mx-auto px-4 md:px-6 py-6 md:py-10 flex flex-col flex-1">
                    {/* Month Selector */}
                    <div className="flex justify-end mb-6">
                        <MonthSelector />
                    </div>

                    {activeTab === 'overview' && <OverviewPage />}
                    {activeTab === 'banks' && <BanksPage />}
                    {activeTab === 'tabungs' && <TabungsPage />}
                    {activeTab === 'recurring' && <RecurringPage />}
                    {activeTab === 'wishlist' && <Wishlist />}
                    {activeTab === 'receipts' && <ReceiptsPage />}
                    {activeTab === 'settings' && <SettingsPage />}
                </div>
            </main>

            {/* Modals */}
            {isArchiveOpen && (
                <ArchiveModal onClose={() => setIsArchiveOpen(false)} />
            )}
        </div>
    );
}

export default function App() {
    return (
        <KansoProvider>
            <InnerApp />
        </KansoProvider>
    );
}
