import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [balanceInput, setBalanceInput] = useState();
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Auto-advance the first two textual screens
    useEffect(() => {
        if (step === 0 || step === 1) {
            const timer = setTimeout(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                    setStep((s) => s + 1);
                    setIsTransitioning(false);
                }, 800); // 800ms fade out before next step
            }, 4000); // 4 seconds per screen
            return () => clearTimeout(timer);
        }
    }, [step]);

    const handleFinish = (e) => {
        e.preventDefault();
        if (balanceInput && !isNaN(parseFloat(balanceInput))) {
            setIsTransitioning(true);
            setTimeout(() => {
                onComplete(parseFloat(balanceInput));
            }, 800);
        }
    };

    return (
        <div className="fixed inset-0 bg-paper z-50 flex flex-col items-center justify-center min-h-screen px-6">

            {/* Brand Watermark */}
            <div className="absolute top-10 left-10 md:top-20 md:left-20">
                <h1 className="font-sans text-xs tracking-[0.3em] font-medium text-ink">
                    KANSO.
                </h1>
            </div>

            <div
                className={`max-w-xl text-center transition-opacity duration-800 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
            >
                {step === 0 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink">
                            Welcome to Kanso.
                        </h2>
                        <p className="mt-6 text-lg text-ink-light font-light max-w-md mx-auto animate-slide-up-slow">
                            A quiet space for your finances.
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink">
                            Money is energy.
                        </h2>
                        <p className="mt-6 text-lg text-ink-light font-light max-w-md mx-auto animate-slide-up-slow">
                            Let&apos;s track its flow without judgment. No harsh reds or greens. Just awareness.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-fade-in-slow">
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-ink mb-12">
                            Where are we starting?
                        </h2>

                        <form onSubmit={handleFinish} className="flex flex-col items-center space-y-12 animate-slide-up-slow">
                            <div className="flex items-end justify-center text-4xl md:text-6xl text-ink font-serif group">
                                <span className="mr-2 text-stone opacity-50 group-focus-within:opacity-100 transition-opacity">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    autoFocus
                                    required
                                    placeholder="0.00"
                                    value={balanceInput}
                                    onChange={(e) => setBalanceInput(e.target.value)}
                                    className="kanso-input text-center w-32 md:w-48 placeholder:text-sand"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!balanceInput}
                                className={`group flex items-center space-x-3 text-sm tracking-widest uppercase transition-all duration-700
                  ${!balanceInput ? 'text-stone opacity-50 cursor-not-allowed' : 'text-ink hover:text-sage'}
                `}
                            >
                                <span>Enter flow</span>
                                <ArrowRight
                                    size={16}
                                    className={`transition-transform duration-500 ${!balanceInput ? '' : 'group-hover:translate-x-2'}`}
                                />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
