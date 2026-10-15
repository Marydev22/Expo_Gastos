
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Expense } from '@/types/expense';
import { useSQLiteContext } from 'expo-sqlite';
import {
  deleteExpense as deleteExpenseFromDatabase,
  getAllExpenses,
  insertExpense,
  updateExpense as updateExpenseInDatabase,
} from '@/database/expenseRepository';
import { deleteInvoiceImage } from '@/utils/imageHelper';
 
interface ExpenseContextType {
  expenses: Expense[];
  // true mientras se leen los gastos guardados al abrir la app
  isLoading: boolean;
  // Ahora devuelve una Promise porque guardar en el telefono es asincrono
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  getSortedExpenses: (sortBy: 'amount' | 'date', order?: 'asc' | 'desc') => Expense[];
}
 
// Arranca en undefined para poder avisar si alguien usa el hook sin Provider
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);
 
// Fase 3: los gastos se guardan en una base de datos SQLite dentro del telefono.
// La interfaz del contexto es la misma de la fase 2, por eso las pantallas no cambian.
export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Conexion a la base que abrio SQLiteProvider en _layout.tsx
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 
  // Se ejecuta al montar el Provider (al abrir la app).
  // db va en las dependencias porque se usa adentro; no cambia mientras la app esta abierta.
  useEffect(() => {
    const cargarGastos = async () => {
      try {
        const guardados = await getAllExpenses(db);
        setExpenses(guardados);
      } catch (error) {
        // Si falla la consulta, la app arranca vacia
        console.error('No se pudieron cargar los gastos', error);
      } finally {
        // Haya funcionado o no, ya terminamos de cargar
        setIsLoading(false);
      }
    };
 
    cargarGastos();
  }, [db]);
 
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    // Timestamp + algo aleatorio para que dos gastos seguidos no repitan id
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
    };
 
    // Primero se inserta en la base y DESPUES se actualiza la pantalla.
    // Si el INSERT falla, lanza el error y el estado no cambia.
    // Solo se escribe una fila: ya no hace falta reescribir toda la lista.
    await insertExpense(db, newExpense);
 
    // Va al principio para que el ultimo gasto salga arriba
    setExpenses((prev) => [newExpense, ...prev]);
  };
 
  const getCurrentMonthExpenses = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
 
    return expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });
  };
 
  const getMonthlyTotal = () => {
    return getCurrentMonthExpenses().reduce(
      (total, expense) => total + expense.amount,
      0
    );
  };

  const updateExpense = async (expense: Expense) => {
    await updateExpenseInDatabase(db, expense);
    setExpenses((prev) => prev.map((item) => item.id === expense.id ? expense : item));
  };

  const deleteExpense = async (expenseId: string) => {
    const expense = expenses.find((item) => item.id === expenseId);

    // Primero se borra la fila en SQLite; si eso falla nada mas cambio
    await deleteExpenseFromDatabase(db, expenseId);

    // Despues el comprobante asociado (si tenia)
    if (expense?.invoice_uri) {
      await deleteInvoiceImage(expense.invoice_uri);
    }

    setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
  };

  const getSortedExpenses = (
    sortBy: 'amount' | 'date',
    order: 'asc' | 'desc' = 'desc'
  ) => {
    return [...getCurrentMonthExpenses()].sort((a, b) => {
      const comparison = sortBy === 'amount'
        ? a.amount - b.amount
        : new Date(a.date).getTime() - new Date(b.date).getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  };
 
  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        getMonthlyTotal,
        getCurrentMonthExpenses,
        getSortedExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
 
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
