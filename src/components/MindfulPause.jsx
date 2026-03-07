import { Circle } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

export default function MindfulPause() {
    const { type, amount, merchant, handleGoBack: onGoBack, handleConfirm: onConfirm } = useKanso();
    const formattedAmount = parseFloat(amount || 0).toFixed(2);
    const isExpense = type === 'expense';
    const isSavings = type === 'savings';

    return (
        <div className="animate-fade-in flex flex-col items-center text-center py-6">
            {/* Pulsing Enso circle */}
            <Circle
                size={36}
                strokeWidth={1}
                className="mb-8 animate-pulse-slow text-sage"
            />

            <h3 className="font-serif text-3xl mb-5 text-ink">Mindful Pause</h3>

            <p className="font-light leading-relaxed max-w-sm mb-10 text-ink-light">
                {isExpense
                    ? `You are parting with RM${formattedAmount} at ${merchant}. Take a breath. Does this align with your current intentions?`
                    : isSavings
                    ? `You are saving RM${formattedAmount} for ${merchant}. This brings you closer to your goal.`
                    : `You are receiving RM${formattedAmount} from ${merchant}. Take a moment to appreciate this inflow.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                {/* Cancel */}
                <button
                    onClick={onGoBack}
                    className="px-6 py-3 text-xs tracking-[0.2em] uppercase text-ink-light
                     hover:text-ink transition-colors duration-300 cursor-pointer"
                >
                    Go Back
                </button>

                {/* Confirm */}
                <button
                    onClick={onConfirm}
                    className="px-8 py-3 text-xs tracking-[0.2em] uppercase rounded-full
                     bg-ink text-paper transition-opacity duration-300 hover:opacity-80 cursor-pointer"
                >
                    Record {isExpense ? 'Outflow' : isSavings ? 'Savings' : 'Inflow'}
                </button>
            </div>
        </div>
    );
}
