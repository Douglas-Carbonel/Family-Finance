import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";

// Types
export type CategoryType = "expense" | "income";

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon?: string;
}

export interface Account {
  id: string;
  name: string;
  type: "checking" | "credit" | "savings" | "cash" | "other";
  balance: number; // This will be calculated in a real app, but for mock we can init it
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO String
  categoryId: string;
  accountId: string;
  type: "income" | "expense";
}

// Initial Data
export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Alimentação", type: "expense", color: "#ef4444" }, // Red
  { id: "cat-2", name: "Moradia", type: "expense", color: "#f97316" }, // Orange
  { id: "cat-3", name: "Transporte", type: "expense", color: "#eab308" }, // Yellow
  { id: "cat-4", name: "Saúde", type: "expense", color: "#10b981" }, // Emerald
  { id: "cat-5", name: "Lazer", type: "expense", color: "#06b6d4" }, // Cyan
  { id: "cat-6", name: "Educação", type: "expense", color: "#6366f1" }, // Indigo
  { id: "cat-7", name: "Salário", type: "income", color: "#22c55e" }, // Green
  { id: "cat-8", name: "Investimentos", type: "income", color: "#8b5cf6" }, // Violet
  { id: "cat-9", name: "Outros", type: "expense", color: "#64748b" }, // Slate
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: "acc-1", name: "Conta Corrente", type: "checking", balance: 2500.00 },
  { id: "acc-2", name: "Cartão de Crédito", type: "credit", balance: -1200.50 },
  { id: "acc-3", name: "Reserva de Emergência", type: "savings", balance: 15000.00 },
  { id: "acc-4", name: "Carteira", type: "cash", balance: 150.00 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", description: "Supermercado Semanal", amount: 450.00, date: new Date().toISOString(), categoryId: "cat-1", accountId: "acc-1", type: "expense" },
  { id: "t2", description: "Aluguel", amount: 1800.00, date: new Date().toISOString(), categoryId: "cat-2", accountId: "acc-1", type: "expense" },
  { id: "t3", description: "Uber Trabalho", amount: 24.90, date: new Date(Date.now() - 86400000).toISOString(), categoryId: "cat-3", accountId: "acc-2", type: "expense" },
  { id: "t4", description: "Salário Mensal", amount: 5500.00, date: new Date(Date.now() - 86400000 * 5).toISOString(), categoryId: "cat-7", accountId: "acc-1", type: "income" },
  { id: "t5", description: "Cinema", amount: 80.00, date: new Date(Date.now() - 86400000 * 2).toISOString(), categoryId: "cat-5", accountId: "acc-2", type: "expense" },
];

// Context
interface FinanceContextType {
  categories: Category[];
  accounts: Account[];
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, "id" | "balance">) => void;
  addCategory: (category: Omit<Category, "id">) => void;
  getAccountBalance: (accountId: string) => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = (account: Omit<Account, "id" | "balance">) => {
    const newAccount = { ...account, id: Math.random().toString(36).substr(2, 9), balance: 0 };
    setAccounts(prev => [...prev, newAccount]);
  };

  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory = { ...category, id: Math.random().toString(36).substr(2, 9) };
    setCategories(prev => [...prev, newCategory]);
  };

  const getAccountBalance = (accountId: string) => {
    // In a real app, we might calculate this from all transactions + initial balance
    // For this mock, we'll take the initial balance from the account definition
    // and apply transaction deltas that happened "after" (or just apply all for simplicity since we don't store initial date)
    
    const account = accounts.find(a => a.id === accountId);
    if (!account) return 0;
    
    // Simple calculation: Initial Balance (mocked) + Incomes - Expenses linked to this account
    // Note: In this simple mock, we assume the 'balance' field in Account is the 'starting' balance before these transactions.
    // Or simpler: The balance field IS the current balance. 
    // Let's make it dynamic:
    
    let balance = account.balance;
    
    // We won't re-calculate strictly from transactions to avoid complex logic about "when" the balance was set.
    // Instead, let's just say the displayed balance is the stored balance.
    // BUT, for the "Entradas vs Saídas" requirement, we need to sum transactions.
    
    // Let's change strategy: The account.balance is the "Current Balance".
    // When adding a transaction, we should update the account balance? 
    // No, cleaner for React state is to calculate derived state.
    
    // Let's assume account.balance is the "Starting Balance".
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    const income = accountTransactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expense = accountTransactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
    
    return balance + income - expense;
  };

  return (
    <FinanceContext.Provider value={{ categories, accounts, transactions, addTransaction, deleteTransaction, addAccount, addCategory, getAccountBalance }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
