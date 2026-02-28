import React, { useState } from 'react';
import { Leaf, X } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function GratitudeEcho({ item, onDismiss }) {
    const { patienceQueue, setPatienceQueue } = useKanso();
    const [responded, setResponded] = useState(false);
    const [response, setResponse] = useState(null);

    const handleResponse = (bringsJoy) => {
        setResponse(bringsJoy);
        setResponded(true);

        setTimeout(() => {
            setPatienceQueue(patienceQueue.filter(i => i.id !== item.id));
            onDismiss();
        }, 1500);
    };

    const handleDismiss = () => {
        setPatienceQueue(patienceQueue.filter(i => i.id !== item.id));
        onDismiss();
    };

    return (
        <div className="bg-sage/5 border border-sage/30 p-6 animate-fade-in">
            {!responded ? (
                <>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                                <Leaf size={18} className="text-sage" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-sage mb-1">Gratitude Echo</p>
                                <h3 className="font-serif text-xl text-ink">A moment of reflection</h3>
                            </div>
                        </div>
                        <button 
                            onClick={handleDismiss}
                            className="text-stone hover:text-ink transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={16} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-ink text-lg leading-relaxed">
                            Does <span className="font-serif italic">"{item.name}"</span> still bring you joy?
                        </p>
                        <p className="text-sm text-ink-light mt-2">
                            It's been 14 days since you acquired this. No judgment—just a gentle check-in.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleResponse(true)}
                            className="flex-1 border border-sage/50 hover:border-sage bg-white hover:bg-sage/10 text-ink py-3 px-4 transition-all duration-300"
                        >
                            Yes, it does
                        </button>
                        <button
                            onClick={() => handleResponse(false)}
                            className="flex-1 border border-sand hover:border-stone text-ink py-3 px-4 transition-all duration-300"
                        >
                            Not really
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center animate-pulse">
                        <Leaf size={18} className="text-sage" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                        <p className="text-ink">
                            {response 
                                ? "Thank you for your awareness. May it continue to serve your journey." 
                                : "Thank you for your honesty. This wisdom will guide future choices."
                            }
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}