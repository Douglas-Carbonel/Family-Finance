import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type { 
  Category, 
  InsertCategory, 
  Account, 
  InsertAccount, 
  Transaction, 
  InsertTransaction 
} from "@shared/schema";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
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
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
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
    type?: string;
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
    if (filters?.type) {
      conditions.push(eq(schema.transactions.type, filters.type));
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

  async deleteTransaction(id: number): Promise<void> {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, id));
  }
}

export const storage = new DatabaseStorage();
