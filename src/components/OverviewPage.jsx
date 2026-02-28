import { useKanso } from '../context/KansoContext';
import NarrativeInput from './NarrativeInput';
import MindfulPause from './MindfulPause';
import Ledger from './Ledger';

export default function OverviewPage() {
    const {
        balance,
        filteredTransactions: transactions,
        vessels,
        type, setType,
        amount, setAmount,
        merchant, setMerchant,
        category, setCategory,
        isReflecting,
        handleReflect: onReflect,
        handleGoBack: onGoBack,
        handleConfirm: onConfirm,
        handleDeleteTransaction: onDelete
    } = useKanso();

    return (
        <div className="animate-fade-in">
            {/* Balance */}
            <section className="mb-20">
                <p className="tracking-widest text-xs uppercase mb-4 text-ink-light">
                    Current Balance
                </p>
                <h1 className="font-serif text-6xl md:text-8xl tracking-tight text-ink transition-all duration-500">
                    RM{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h1>
                <p className="mt-4 text-sm font-light text-ink-light">
                    Available across all accounts.
                </p>
            </section>

            {/* Two-column: Journal + Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Narrative Entry / Mindful Pause */}
                <section className="lg:col-span-5">
                    <div className="flex justify-between items-end border-b border-sand pb-4 mb-10">
                        <h2 className="font-serif text-2xl text-ink">
                            {isReflecting ? 'Reflection' : 'Journal'}
                        </h2>
                    </div>

                    <div className="min-h-[300px] flex flex-col justify-center">
                        {!isReflecting ? (
                            <NarrativeInput
                                type={type}
                                setType={setType}
                                amount={amount}
                                setAmount={setAmount}
                                merchant={merchant}
                                setMerchant={setMerchant}
                                category={category}
                                setCategory={setCategory}
                                onReflect={onReflect}
                                vessels={vessels}
                            />
                        ) : (
                            <MindfulPause
                                type={type}
                                amount={amount}
                                merchant={merchant}
                                onGoBack={onGoBack}
                                onConfirm={onConfirm}
                            />
                        )}
                    </div>
                </section>

                {/* Ledger */}
                <section className="lg:col-span-7">
                    <Ledger transactions={transactions} onDelete={onDelete} />
                </section>
            </div>
        </div>
    );
}
