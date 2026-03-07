import { useKanso } from '../context/KansoContext';
import Ledger from './Ledger';

export default function TransactionsPage() {
    const { filteredTransactions, handleDeleteTransaction } = useKanso();

    return (
        <div className="animate-fade-in space-y-16 pb-20">
            <section>
                <div className="flex justify-between items-end mb-4">
                    <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink">
                        Transactions
                    </h1>
                </div>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Your complete record of expenses, income, and savings. Each entry is tracked with intention and purpose.
                </p>
            </section>

            <Ledger transactions={filteredTransactions} onDelete={handleDeleteTransaction} />
        </div>
    );
}