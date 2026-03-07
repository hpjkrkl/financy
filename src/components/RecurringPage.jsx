import { useState } from 'react';
import { Plus, Calendar, Check } from 'lucide-react';
import { useKanso } from '../context/KansoContext';

let nextId = Date.now();
const generateId = () => ++nextId;

export default function RecurringPage() {
    const { recurringExpenses, setRecurringExpenses } = useKanso();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        dueDate: 1,
        isActive: true,
        autoRecord: true
    });

    const categories = ['Housing', 'Utilities', 'Entertainment', 'Transportation', 'Insurance', 'Subscription', 'Other'];

    const handleAdd = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.amount || !formData.category) return;

        const newExpense = {
            id: generateId(),
            name: formData.name,
            amount: parseFloat(formData.amount),
            category: formData.category,
            dueDate: parseInt(formData.dueDate),
            isActive: formData.isActive,
            autoRecord: formData.autoRecord
        };

        setRecurringExpenses([...recurringExpenses, newExpense]);
        resetForm();
        setShowAddForm(false);
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setFormData({
            name: expense.name,
            amount: expense.amount,
            category: expense.category,
            dueDate: expense.dueDate,
            isActive: expense.isActive,
            autoRecord: expense.autoRecord
        });
        setShowAddForm(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.amount || !formData.category) return;

        setRecurringExpenses(recurringExpenses.map(expense =>
            expense.id === editingId
                ? {
                    ...expense,
                    name: formData.name,
                    amount: parseFloat(formData.amount),
                    category: formData.category,
                    dueDate: parseInt(formData.dueDate),
                    isActive: formData.isActive,
                    autoRecord: formData.autoRecord
                }
                : expense
        ));

        resetForm();
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this recurring expense?')) {
            setRecurringExpenses(recurringExpenses.filter(expense => expense.id !== id));
        }
    };

    const handleToggleActive = (id) => {
        setRecurringExpenses(recurringExpenses.map(expense =>
            expense.id === id ? { ...expense, isActive: !expense.isActive } : expense
        ));
    };

    const handleToggleAutoRecord = (id) => {
        setRecurringExpenses(recurringExpenses.map(expense =>
            expense.id === id ? { ...expense, autoRecord: !expense.autoRecord } : expense
        ));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            amount: '',
            category: '',
            dueDate: 1,
            isActive: true,
            autoRecord: true
        });
    };

    const activeExpenses = recurringExpenses.filter(e => e.isActive);
    const totalMonthly = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="animate-fade-in space-y-16">
            <section>
                <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-ink mb-4">
                    Recurring Expenses
                </h1>
                <p className="text-sm font-light text-ink-light leading-relaxed max-w-xl mb-12">
                    Track your fixed monthly expenses. These are your consistent commitments that recur each month.
                </p>

                {/* Monthly Total */}
                <div className="bg-paper border border-sand p-6 md:p-8 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-ink-light">Monthly Total</p>
                            <p className="text-4xl md:text-5xl font-serif text-ink mt-2 tabular-nums">
                                RM{totalMonthly.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-ink-light uppercase tracking-widest">
                                {activeExpenses.length} Active {activeExpenses.length === 1 ? 'Expense' : 'Expenses'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => {
                        resetForm();
                        setEditingId(null);
                        setShowAddForm(!showAddForm);
                    }}
                    className="flex items-center gap-2 px-6 py-3 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                >
                    <Plus size={18} strokeWidth={1.5} />
                    {editingId ? 'Cancel Edit' : 'Add Recurring Expense'}
                </button>
            </section>

            {/* Add/Edit Form */}
            {showAddForm && (
                <section className="bg-paper border border-sand p-6 md:p-8 animate-fade-in">
                    <h2 className="text-2xl font-serif text-ink mb-6">
                        {editingId ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
                    </h2>
                    <form onSubmit={editingId ? handleUpdate : handleAdd} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Rent"
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Amount (RM)</label>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink placeholder:text-stone border-b border-sand focus:border-ink outline-none transition-colors pb-2"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-ink-light block">Due Date</label>
                                <select
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-transparent text-xl md:text-2xl text-ink border-b border-sand focus:border-ink outline-none transition-colors pb-2 cursor-pointer"
                                >
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>{i + 1}{i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-sand focus:border-ink"
                                />
                                <span className="text-sm text-ink">Active</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.autoRecord}
                                    onChange={(e) => setFormData({ ...formData, autoRecord: e.target.checked })}
                                    className="w-5 h-5 rounded border-sand focus:border-ink"
                                />
                                <span className="text-sm text-ink">Auto-record monthly</span>
                            </label>
                        </div>

                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingId(null);
                                    resetForm();
                                }}
                                className="h-12 px-6 border border-sand hover:border-ink transition-all duration-300 text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!formData.name || !formData.amount || !formData.category}
                                className="h-12 px-6 border border-sage bg-sage text-white hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                            >
                                {editingId ? 'Update' : 'Add Expense'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Recurring Expenses List */}
            <section className="space-y-6">
                {recurringExpenses.length === 0 ? (
                    <div className="text-center py-20 border border-sand/50 text-stone text-sm italic">
                        No recurring expenses added yet. Add your first expense to start tracking.
                    </div>
                ) : (
                    recurringExpenses.map((expense, idx) => {
                        const staggerClass = `stagger-${Math.min((idx % 5) + 1, 5)}`;

                        return (
                            <div
                                key={expense.id}
                                className={`border ${expense.isActive ? 'border-sand' : 'border-sand/30 bg-sand/5'} p-6 md:p-8 animate-slide-up-slow ${staggerClass} transition-colors duration-500`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={`text-2xl font-serif ${expense.isActive ? 'text-ink' : 'text-stone'}`}>
                                                {expense.name}
                                            </h3>
                                            {!expense.isActive && (
                                                <span className="text-xs text-stone uppercase tracking-widest border border-sand/50 px-2 py-1">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-ink-light mb-3">{expense.category}</p>
                                        <div className="flex items-center gap-4 text-sm text-ink-light">
                                            <span className="flex items-center gap-2">
                                                <Calendar size={14} strokeWidth={1.5} />
                                                Due: {expense.dueDate}{expense.dueDate === 1 ? 'st' : expense.dueDate === 2 ? 'nd' : expense.dueDate === 3 ? 'rd' : 'th'} of each month
                                            </span>
                                            {expense.autoRecord && (
                                                <span className="flex items-center gap-2 text-sage">
                                                    <Check size={14} strokeWidth={1.5} />
                                                    Auto-record enabled
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-3xl md:text-4xl font-serif text-ink tabular-nums">
                                            RM{expense.amount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-ink-light uppercase tracking-widest mt-1">
                                            Monthly
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-6 pt-6 border-t border-sand">
                                    <button
                                        onClick={() => handleToggleActive(expense.id)}
                                        className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-300 ${
                                            expense.isActive 
                                                ? 'border-sand hover:border-ink hover:bg-ink hover:text-paper' 
                                                : 'border-sage text-sage hover:bg-sage hover:text-white'
                                        }`}
                                    >
                                        {expense.isActive ? 'Pause' : 'Activate'}
                                    </button>
                                    {expense.isActive && (
                                        <button
                                            onClick={() => handleToggleAutoRecord(expense.id)}
                                            className={`px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-300 ${
                                                expense.autoRecord 
                                                    ? 'border-sage text-sage' 
                                                    : 'border-sand hover:border-ink'
                                            }`}
                                        >
                                            {expense.autoRecord ? 'Disable Auto-record' : 'Enable Auto-record'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(expense)}
                                        className="px-4 py-2 text-xs uppercase tracking-widest border border-sand hover:border-ink transition-all duration-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense.id)}
                                        className="px-4 py-2 text-xs uppercase tracking-widest border border-sand/50 hover:border-red-300 hover:text-red-300 transition-all duration-300 ml-auto"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </section>
        </div>
    );
}
