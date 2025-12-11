import type { Category, Account, Transaction, InsertCategory, InsertAccount, InsertTransaction } from "@shared/schema";

const API_BASE = "/api";

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
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Transaction[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append("categoryId", filters.categoryId.toString());
  if (filters?.accountId) params.append("accountId", filters.accountId.toString());
  if (filters?.type) params.append("type", filters.type);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const url = params.toString() ? `${API_BASE}/transactions?${params}` : `${API_BASE}/transactions`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  return response.json();
}

export async function createTransaction(transaction: InsertTransaction): Promise<Transaction> {
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
