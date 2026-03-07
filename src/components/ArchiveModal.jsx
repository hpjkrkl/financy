import { useRef } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function ArchiveModal({ onClose }) {
    const fileInputRef = useRef(null);
    const { transactions, vessels, patienceQueue, startingBalance } = useKanso();

    const handleExport = () => {
        const data = {
            kanso_onboarded: 'true',
            kanso_starting_balance: String(startingBalance),
            kanso_transactions: JSON.stringify(transactions),
            kanso_vessels: JSON.stringify(vessels),
            kanso_patience_queue: JSON.stringify(patienceQueue),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanso_archive_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.kanso_onboarded) localStorage.setItem('kanso_onboarded', data.kanso_onboarded);
                if (data.kanso_starting_balance) localStorage.setItem('kanso_starting_balance', data.kanso_starting_balance);
                if (data.kanso_transactions) localStorage.setItem('kanso_transactions', data.kanso_transactions);

                // Reload to reflect newly imported data
                window.location.reload();
            } catch {
                console.error("Failed to parse archive file");
                alert("This file is not a valid Kanso archive.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-paper/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-paper border border-sand shadow-2xl p-8 md:p-12 max-w-md w-full animate-slide-up-slow flex flex-col gap-8">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-stone hover:text-ink transition-colors focus:outline-none"
                    aria-label="Close archive modal"
                >
                    <X size={20} strokeWidth={1.5} />
                </button>

                <div>
                    <h2 className="font-serif text-3xl text-ink">Zen Archive</h2>
                    <p className="text-sm font-light text-ink-light mt-2 leading-relaxed">
                        Control your data flow. Export your mindful journal to a secure file, or restore a previous journey.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-3 w-full p-4 border border-sand hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300 text-ink text-sm tracking-widest uppercase cursor-pointer"
                    >
                        <Download size={18} strokeWidth={1.5} />
                        Export Flow
                    </button>

                    <button
                        onClick={handleImportClick}
                        className="flex items-center justify-center gap-3 w-full p-4 border border-sand hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300 text-ink text-sm tracking-widest uppercase cursor-pointer"
                    >
                        <Upload size={18} strokeWidth={1.5} />
                        Restore Flow
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                </div>
            </div>
        </div>
    );
}
