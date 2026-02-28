import { useKanso } from '../context/KansoContext';

export default function NarrativeInput() {
    const {
        type, setType,
        amount, setAmount,
        merchant, setMerchant,
        category, setCategory,
        handleReflect: onReflect,
        vessels
    } = useKanso();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (amount && merchant && category) {
            onReflect();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="animate-fade-in">
            {/* Mad-libs narrative sentence */}
            <div className="font-serif text-xl md:text-3xl leading-[2.4] md:leading-[2.2] text-ink-light">
                &ldquo;I am recording an{' '}

                {/* Expense / Income toggle */}
                <button
                    type="button"
                    onClick={() => setType(type === 'expense' ? 'income' : 'expense')}
                    className="inline-block mx-1 pb-1 border-b border-ink text-ink hover:opacity-70 transition-opacity duration-300 focus:outline-none font-serif cursor-pointer"
                >
                    {type}
                </button>

                {' '}of{' '}
                <span className="text-ink">RM</span>

                {/* Amount input */}
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    required
                    className="kanso-input w-20 md:w-24 inline-block text-center mx-1 font-serif text-xl md:text-3xl"
                />

                {' '}at{' '}

                {/* Merchant input */}
                <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="merchant"
                    required
                    className="kanso-input w-24 md:w-36 inline-block text-center mx-1 font-serif text-xl md:text-3xl"
                />

                {' '}for{' '}

                {/* Category / Vessel input */}
                {type === 'expense' ? (
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="kanso-input w-auto inline-block text-center mx-1 font-serif text-xl md:text-3xl bg-transparent appearance-none cursor-pointer border-b border-dashed border-sand/50 pb-1"
                    >
                        <option value="" disabled>vessel</option>
                        <option value="Unallocated">Unallocated</option>
                        {vessels?.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="source"
                        required
                        className="kanso-input w-24 md:w-32 inline-block text-center mx-1 font-serif text-xl md:text-3xl"
                    />
                )}
                .&rdquo;
            </div>

            {/* Submit */}
            <button
                type="submit"
                className="mt-12 px-8 py-3 border border-sand rounded-full text-xs tracking-[0.2em] uppercase text-ink
                   transition-all duration-300 hover:bg-ink hover:text-paper hover:border-ink cursor-pointer"
            >
                Reflect
            </button>
        </form>
    );
}
