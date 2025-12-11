import type { Category, Account, Transaction, InsertCategory, InsertAccount, InsertTransaction, Member, InsertMember, Budget, InsertBudget } from "@shared/schema";

const API_BASE = "/api";

// Members
export async function getMembers(): Promise<Member[]> {
  const response = await fetch(`${API_BASE}/members`);
  if (!response.ok) throw new Error("Failed to fetch members");
  return response.json();
}

export async function createMember(member: InsertMember): Promise<Member> {
  const response = await fetch(`${API_BASE}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Failed to create member");
  return response.json();
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");
  return response.json();
}

export async function createCategory(category: InsertCategory): Promise<Category> {
  const response = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to create category");
  return response.json();
}

// Accounts
export async function getAccounts(): Promise<Account[]> {
  const response = await fetch(`${API_BASE}/accounts`);
  if (!response.ok) throw new Error("Failed to fetch accounts");
  return response.json();
}

export async function createAccount(account: InsertAccount): Promise<Account> {
  const response = await fetch(`${API_BASE}/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  if (!response.ok) throw new Error("Failed to create account");
  return response.json();
}

// Transactions
export async function getTransactions(filters?: {
  categoryId?: number;
  accountId?: number;
  memberId?: number;
  type?: string;
  recurrenceType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append("categoryId", filters.categoryId.toString());
  if (filters?.accountId) params.append("accountId", filters.accountId.toString());
  if (filters?.memberId) params.append("memberId", filters.memberId.toString());
  if (filters?.type) params.append("type", filters.type);
  if (filters?.recurrenceType) params.append("recurrenceType", filters.recurrenceType);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const url = params.toString() ? `${API_BASE}/transactions?${params}` : `${API_BASE}/transactions`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
}

export interface CreateTransactionData extends InsertTransaction {
  totalInstallments?: number;
}

export async function createTransaction(transaction: CreateTransactionData): Promise<Transaction | Transaction[]> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) throw new Error("Failed to create transaction");
  return response.json();
}

export async function deleteTransaction(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete transaction");
}

// Budgets
export async function getBudgets(month?: number, year?: number): Promise<Budget[]> {
  const params = new URLSearchParams();
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());

  const url = params.toString() ? `${API_BASE}/budgets?${params}` : `${API_BASE}/budgets`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch budgets");
  return response.json();
}

export async function createBudget(budget: InsertBudget): Promise<Budget> {
  const response = await fetch(`${API_BASE}/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(budget),
  });
  if (!response.ok) throw new Error("Failed to create budget");
  return response.json();
}

// Dashboard Summary
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  incomeByMember: { member: Member; total: number }[];
  expensesByCategory: { category: Category; total: number }[];
  expensesByType: {
    fixed: number;
    installment: number;
    oneTime: number;
  };
}

export async function getDashboardSummary(month?: number, year?: number): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (month) params.append("month", month.toString());
  if (year) params.append("year", year.toString());

  const url = params.toString() ? `${API_BASE}/dashboard/summary?${params}` : `${API_BASE}/dashboard/summary`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
}
