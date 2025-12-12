import type { 
  Family, InsertFamily,
  Member, InsertMember, 
  IncomeType, InsertIncomeType,
  ExpenseType, InsertExpenseType,
  ExpenseCategory, InsertExpenseCategory,
  IncomeCategory, InsertIncomeCategory,
  Account, InsertAccount, 
  Movement, InsertMovement,
  Transaction, InsertTransaction, 
  Budget, InsertBudget 
} from "@shared/schema";

const API_BASE = "/api";

// Families
export async function getFamilies(): Promise<Family[]> {
  const response = await fetch(`${API_BASE}/families`);
  if (!response.ok) throw new Error("Failed to fetch families");
  return response.json();
}

export async function createFamily(family: InsertFamily): Promise<Family> {
  const response = await fetch(`${API_BASE}/families`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(family),
  });
  if (!response.ok) throw new Error("Failed to create family");
  return response.json();
}

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

export async function updateMember(id: number, member: Partial<InsertMember>): Promise<Member> {
  const response = await fetch(`${API_BASE}/members/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error("Failed to update member");
  return response.json();
}

// Income Types
export async function getIncomeTypes(): Promise<IncomeType[]> {
  const response = await fetch(`${API_BASE}/income-types`);
  if (!response.ok) throw new Error("Failed to fetch income types");
  return response.json();
}

export async function createIncomeType(incomeType: InsertIncomeType): Promise<IncomeType> {
  const response = await fetch(`${API_BASE}/income-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(incomeType),
  });
  if (!response.ok) throw new Error("Failed to create income type");
  return response.json();
}

// Expense Types
export async function getExpenseTypes(): Promise<ExpenseType[]> {
  const response = await fetch(`${API_BASE}/expense-types`);
  if (!response.ok) throw new Error("Failed to fetch expense types");
  return response.json();
}

export async function createExpenseType(expenseType: InsertExpenseType): Promise<ExpenseType> {
  const response = await fetch(`${API_BASE}/expense-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expenseType),
  });
  if (!response.ok) throw new Error("Failed to create expense type");
  return response.json();
}

// Expense Categories
export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const response = await fetch(`${API_BASE}/expense-categories`);
  if (!response.ok) throw new Error("Failed to fetch expense categories");
  return response.json();
}

export async function createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
  const response = await fetch(`${API_BASE}/expense-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to create expense category");
  return response.json();
}

// Income Categories
export async function getIncomeCategories(): Promise<IncomeCategory[]> {
  const response = await fetch(`${API_BASE}/income-categories`);
  if (!response.ok) throw new Error("Failed to fetch income categories");
  return response.json();
}

export async function createIncomeCategory(category: InsertIncomeCategory): Promise<IncomeCategory> {
  const response = await fetch(`${API_BASE}/income-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(category),
  });
  if (!response.ok) throw new Error("Failed to create income category");
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

// Movements (Income entries)
export async function getMovements(filters?: {
  memberId?: number;
  incomeTypeId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<Movement[]> {
  const params = new URLSearchParams();
  if (filters?.memberId) params.append("memberId", filters.memberId.toString());
  if (filters?.incomeTypeId) params.append("incomeTypeId", filters.incomeTypeId.toString());
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const url = params.toString() ? `${API_BASE}/movements?${params}` : `${API_BASE}/movements`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch movements");
  return response.json();
}

export async function createMovement(movement: InsertMovement): Promise<Movement> {
  const response = await fetch(`${API_BASE}/movements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movement),
  });
  if (!response.ok) throw new Error("Failed to create movement");
  return response.json();
}

export async function deleteMovement(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/movements/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete movement");
}

// Transactions (Expense entries)
export async function getTransactions(filters?: {
  memberId?: number;
  expenseTypeId?: number;
  expenseCategoryId?: number;
  accountId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters?.memberId) params.append("memberId", filters.memberId.toString());
  if (filters?.expenseTypeId) params.append("expenseTypeId", filters.expenseTypeId.toString());
  if (filters?.expenseCategoryId) params.append("expenseCategoryId", filters.expenseCategoryId.toString());
  if (filters?.accountId) params.append("accountId", filters.accountId.toString());
  if (filters?.status) params.append("status", filters.status);
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

export async function updateTransactionStatus(id: number, status: string): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error("Failed to update transaction status");
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
  totalExpenses: number;
  balance: number;
  movementsCount: number;
  transactionsCount: number;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await fetch(`${API_BASE}/dashboard/summary`);
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
}

// Committed expenses
export interface CommittedExpenses {
  monthlyCommitments: { month: number; year: number; amount: number }[];
  totalCommitted: number;
}

export async function getCommittedExpenses(): Promise<CommittedExpenses> {
  const response = await fetch(`${API_BASE}/dashboard/committed`);
  if (!response.ok) throw new Error("Failed to fetch committed expenses");
  return response.json();
}
