import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
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

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  // Families
  getFamilies(): Promise<Family[]>;
  getFamilyById(id: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  
  // Members
  getMembers(): Promise<Member[]>;
  getMemberById(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined>;
  
  // Income Types
  getIncomeTypes(): Promise<IncomeType[]>;
  createIncomeType(incomeType: InsertIncomeType): Promise<IncomeType>;
  
  // Expense Types
  getExpenseTypes(): Promise<ExpenseType[]>;
  createExpenseType(expenseType: InsertExpenseType): Promise<ExpenseType>;
  
  // Expense Categories
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  
  // Income Categories
  getIncomeCategories(): Promise<IncomeCategory[]>;
  createIncomeCategory(category: InsertIncomeCategory): Promise<IncomeCategory>;
  
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccountById(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  
  // Movements (Income entries)
  getMovements(filters?: {
    memberId?: number;
    incomeTypeId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Movement[]>;
  getMovementById(id: number): Promise<Movement | undefined>;
  createMovement(movement: InsertMovement): Promise<Movement>;
  deleteMovement(id: number): Promise<void>;
  
  // Transactions (Expense entries)
  getTransactions(filters?: {
    memberId?: number;
    expenseTypeId?: number;
    expenseCategoryId?: number;
    accountId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  createInstallmentTransactions(baseTransaction: InsertTransaction, totalInstallments: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<void>;
  
  // Budgets
  getBudgets(month: number, year: number): Promise<Budget[]>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, amount: string): Promise<Budget | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Families
  async getFamilies(): Promise<Family[]> {
    return await db.select().from(schema.families);
  }

  async getFamilyById(id: number): Promise<Family | undefined> {
    const result = await db.select().from(schema.families).where(eq(schema.families.id, id));
    return result[0];
  }

  async createFamily(family: InsertFamily): Promise<Family> {
    const result = await db.insert(schema.families).values(family).returning();
    return result[0];
  }

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

  async updateMember(id: number, member: Partial<InsertMember>): Promise<Member | undefined> {
    const result = await db.update(schema.members)
      .set(member)
      .where(eq(schema.members.id, id))
      .returning();
    return result[0];
  }

  // Income Types
  async getIncomeTypes(): Promise<IncomeType[]> {
    return await db.select().from(schema.incomeTypes);
  }

  async createIncomeType(incomeType: InsertIncomeType): Promise<IncomeType> {
    const result = await db.insert(schema.incomeTypes).values(incomeType).returning();
    return result[0];
  }

  // Expense Types
  async getExpenseTypes(): Promise<ExpenseType[]> {
    return await db.select().from(schema.expenseTypes);
  }

  async createExpenseType(expenseType: InsertExpenseType): Promise<ExpenseType> {
    const result = await db.insert(schema.expenseTypes).values(expenseType).returning();
    return result[0];
  }

  // Expense Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(schema.expenseCategories);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const result = await db.insert(schema.expenseCategories).values(category).returning();
    return result[0];
  }

  // Income Categories
  async getIncomeCategories(): Promise<IncomeCategory[]> {
    return await db.select().from(schema.incomeCategories);
  }

  async createIncomeCategory(category: InsertIncomeCategory): Promise<IncomeCategory> {
    const result = await db.insert(schema.incomeCategories).values(category).returning();
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

  // Movements (Income entries)
  async getMovements(filters?: {
    memberId?: number;
    incomeTypeId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Movement[]> {
    let query = db.select().from(schema.movements);
    
    const conditions = [];
    
    if (filters?.memberId) {
      conditions.push(eq(schema.movements.memberId, filters.memberId));
    }
    if (filters?.incomeTypeId) {
      conditions.push(eq(schema.movements.incomeTypeId, filters.incomeTypeId));
    }
    if (filters?.startDate) {
      conditions.push(gte(schema.movements.date, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(schema.movements.date, filters.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query.orderBy(desc(schema.movements.date));
    return results;
  }

  async getMovementById(id: number): Promise<Movement | undefined> {
    const result = await db.select().from(schema.movements).where(eq(schema.movements.id, id));
    return result[0];
  }

  async createMovement(movement: InsertMovement): Promise<Movement> {
    const result = await db.insert(schema.movements).values(movement).returning();
    return result[0];
  }

  async deleteMovement(id: number): Promise<void> {
    await db.delete(schema.movements).where(eq(schema.movements.id, id));
  }

  // Transactions (Expense entries)
  async getTransactions(filters?: {
    memberId?: number;
    expenseTypeId?: number;
    expenseCategoryId?: number;
    accountId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    let query = db.select().from(schema.transactions);
    
    const conditions = [];
    
    if (filters?.memberId) {
      conditions.push(eq(schema.transactions.memberId, filters.memberId));
    }
    if (filters?.expenseTypeId) {
      conditions.push(eq(schema.transactions.expenseTypeId, filters.expenseTypeId));
    }
    if (filters?.expenseCategoryId) {
      conditions.push(eq(schema.transactions.expenseCategoryId, filters.expenseCategoryId));
    }
    if (filters?.accountId) {
      conditions.push(eq(schema.transactions.accountId, filters.accountId));
    }
    if (filters?.status) {
      conditions.push(eq(schema.transactions.status, filters.status));
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

    // Create first transaction
    const firstInstallment: InsertTransaction = {
      ...baseTransaction,
      amount: installmentAmount.toFixed(2),
      installmentNumber: 1,
      totalInstallments: totalInstallments,
    };

    const firstResult = await db.insert(schema.transactions).values(firstInstallment).returning();
    transactions.push(firstResult[0]);
    const parentId = firstResult[0].id;

    // Create remaining installments
    for (let i = 1; i < totalInstallments; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(installmentDate.getMonth() + i);
      
      const installmentData: InsertTransaction = {
        ...baseTransaction,
        amount: installmentAmount.toFixed(2),
        date: installmentDate,
        installmentNumber: i + 1,
        totalInstallments: totalInstallments,
        parentTransactionId: parentId,
      };

      const result = await db.insert(schema.transactions).values(installmentData).returning();
      transactions.push(result[0]);
    }

    return transactions;
  }

  async updateTransactionStatus(id: number, status: string): Promise<Transaction | undefined> {
    const result = await db.update(schema.transactions)
      .set({ status })
      .where(eq(schema.transactions.id, id))
      .returning();
    return result[0];
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
