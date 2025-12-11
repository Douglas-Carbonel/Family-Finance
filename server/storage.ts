import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import type { 
  Category, InsertCategory, 
  Account, InsertAccount, 
  Transaction, InsertTransaction,
  Member, InsertMember,
  Budget, InsertBudget
} from "@shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // Members
  getMembers(): Promise<Member[]>;
  getMemberById(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccountById(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  
  // Transactions
  getTransactions(filters?: {
    categoryId?: number;
    accountId?: number;
    memberId?: number;
    type?: string;
    recurrenceType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createInstallmentTransactions(baseTransaction: InsertTransaction, totalInstallments: number): Promise<Transaction[]>;
  deleteTransaction(id: number): Promise<void>;
  
  // Budgets
  getBudgets(month: number, year: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, amount: string): Promise<Budget | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Members
  async getMembers(): Promise<Member[]> {
    return await db.select().from(schema.members);
  }

  async getMemberById(id: number): Promise<Member | undefined> {
    const result = await db.select().from(schema.members).where(eq(schema.members.id, id));
    return result[0];
  }

  async createMember(member: InsertMember): Promise<Member> {
    const result = await db.insert(schema.members).values(member).returning();
    return result[0];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(schema.categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const result = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return result[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(schema.categories).values(category).returning();
    return result[0];
  }

  // Accounts
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(schema.accounts);
  }

  async getAccountById(id: number): Promise<Account | undefined> {
    const result = await db.select().from(schema.accounts).where(eq(schema.accounts.id, id));
    return result[0];
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const result = await db.insert(schema.accounts).values(account).returning();
    return result[0];
  }

  // Transactions
  async getTransactions(filters?: {
    categoryId?: number;
    accountId?: number;
    memberId?: number;
    type?: string;
    recurrenceType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    let query = db.select().from(schema.transactions);
    
    const conditions = [];
    
    if (filters?.categoryId) {
      conditions.push(eq(schema.transactions.categoryId, filters.categoryId));
    }
    if (filters?.accountId) {
      conditions.push(eq(schema.transactions.accountId, filters.accountId));
    }
    if (filters?.memberId) {
      conditions.push(eq(schema.transactions.memberId, filters.memberId));
    }
    if (filters?.type) {
      conditions.push(eq(schema.transactions.type, filters.type));
    }
    if (filters?.recurrenceType) {
      conditions.push(eq(schema.transactions.recurrenceType, filters.recurrenceType));
    }
    if (filters?.startDate) {
      conditions.push(gte(schema.transactions.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(schema.transactions.date, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(schema.transactions.date));
    return results;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(schema.transactions).where(eq(schema.transactions.id, id));
    return result[0];
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(schema.transactions).values(transaction).returning();
    return result[0];
  }

  async createInstallmentTransactions(baseTransaction: InsertTransaction, totalInstallments: number): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const baseDate = new Date(baseTransaction.date);
    const installmentAmount = parseFloat(baseTransaction.amount as string) / totalInstallments;

    for (let i = 0; i < totalInstallments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);
      
      const installmentData: InsertTransaction = {
        ...baseTransaction,
        amount: installmentAmount.toFixed(2),
        date: installmentDate,
        recurrenceType: "installment",
        installmentNumber: i + 1,
        totalInstallments: totalInstallments,
        parentTransactionId: i === 0 ? null : undefined, // First one is the parent
      };

      const result = await db.insert(schema.transactions).values(installmentData).returning();
      transactions.push(result[0]);
      
      // Update first transaction as parent for subsequent ones
      if (i === 0) {
        // Update subsequent transactions to point to this parent
        for (let j = 1; j < totalInstallments; j++) {
          const subsequentDate = new Date(baseDate);
          subsequentDate.setMonth(subsequentDate.getMonth() + j);
          
          const subsequentData: InsertTransaction = {
            ...baseTransaction,
            amount: installmentAmount.toFixed(2),
            date: subsequentDate,
            recurrenceType: "installment",
            installmentNumber: j + 1,
            totalInstallments: totalInstallments,
            parentTransactionId: result[0].id,
          };

          const subResult = await db.insert(schema.transactions).values(subsequentData).returning();
          transactions.push(subResult[0]);
        }
        break; // We created all in the first iteration
      }
    }

    return transactions;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }

  // Budgets
  async getBudgets(month: number, year: number): Promise<Budget[]> {
    return await db.select().from(schema.budgets)
      .where(and(
        eq(schema.budgets.month, month),
        eq(schema.budgets.year, year)
      ));
  }

  async createBudget(budget: InsertBudget): Promise<Budget> {
    const result = await db.insert(schema.budgets).values(budget).returning();
    return result[0];
  }

  async updateBudget(id: number, amount: string): Promise<Budget | undefined> {
    const result = await db.update(schema.budgets)
      .set({ amount })
      .where(eq(schema.budgets.id, id))
      .returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
