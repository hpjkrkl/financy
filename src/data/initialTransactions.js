const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const lastMonth = new Date(today);
lastMonth.setMonth(lastMonth.getMonth() - 1);

export const initialTransactions = [
    {
        id: 1,
        type: 'expense',
        amount: 14.5,
        merchant: 'Matcha Teahouse',
        category: 'Dining',
        date: today.toISOString(),
    },
    {
        id: 2,
        type: 'expense',
        amount: 32.0,
        merchant: 'Kinokuniya Books',
        category: 'Education',
        date: today.toISOString(),
    },
    {
        id: 3,
        type: 'income',
        amount: 850.0,
        merchant: 'Client Invoice #042',
        category: 'Freelance',
        date: yesterday.toISOString(),
    },
    {
        id: 4,
        type: 'expense',
        amount: 120.0,
        merchant: 'Farmers Market',
        category: 'Groceries',
        date: yesterday.toISOString(),
    },
    {
        id: 5,
        type: 'expense',
        amount: 45.0,
        merchant: 'Ceramics Class',
        category: 'Education',
        date: lastMonth.toISOString(),
    },
];
