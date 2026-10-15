import {SQLiteDatabase} from 'expo-sqlite';
import { Expense, Category } from '@/types/expense';

interface ExpenseRow {
    id: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
    invoice_uri: string | null;
}

function mapRowToExpense(row: ExpenseRow): Expense {
    return {
        id: row.id,
        amount: row.amount,
        category: row.category as Category,
        date: new Date(row.date),
        description: row.description ?? undefined,
        invoice_uri: row.invoice_uri ?? undefined,
    };
}

export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
    const rows = await db.getAllAsync<ExpenseRow>(
        'SELECT id, amount, category, date, description, invoice_uri FROM expenses ORDER BY date DESC');
        return rows.map(mapRowToExpense);
}

export async function insertExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    await db.runAsync(
        'INSERT INTO expenses (id, amount, category, date, description, invoice_uri) VALUES (?, ?, ?, ?, ?, ?)',
        expense.id,
        expense.amount,
        expense.category,
        expense.date.toISOString(),
        expense.description ?? null,
        expense.invoice_uri ?? null
    );
}

export async function updateExpense(db: SQLiteDatabase, expense: Expense): Promise<void> {
    await db.runAsync(
        'UPDATE expenses SET amount = ?, category = ?, date = ?, description = ?, invoice_uri = ? WHERE id = ?',
        expense.amount,
        expense.category,
        expense.date.toISOString(),
        expense.description ?? null,
        expense.invoice_uri ?? null,
        expense.id
    );
}

export async function deleteExpense(db: SQLiteDatabase, expenseId: string): Promise<void> {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', expenseId);
}