import { sql } from "drizzle-orm";
import { pgTable, text, integer, decimal, timestamp, varchar, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Famílias
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Membros da família
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  familyId: integer("family_id").references(() => families.id),
  aggregateToFamily: boolean("aggregate_to_family").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tipos de Renda (Fixa, Benefício, Extra)
export const incomeTypes = pgTable("income_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
});

// Tipos de Despesa (Avulsa, Fixa, Parcelada)
export const expenseTypes = pgTable("expense_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
});

// Categorias de Despesa (Cartão de crédito, Aluguel, Mercado, etc.)
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#6B7280"),
  icon: varchar("icon", { length: 50 }),
});

// Categorias de Renda (Salário, Vale Alimentação, etc.)
export const incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull().default("#10B981"),
  icon: varchar("icon", { length: 50 }),
});

// Contas bancárias/carteiras
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  initialBalance: decimal("initial_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  memberId: integer("member_id").references(() => members.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Movimentações (Entradas de dinheiro/Rendas) - SEMPRE POSITIVO
export const movements = pgTable("movements", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id),
  incomeTypeId: integer("income_type_id").notNull().references(() => incomeTypes.id),
  incomeCategoryId: integer("income_category_id").references(() => incomeCategories.id),
  accountId: integer("account_id").references(() => accounts.id),
  aggregateToFamily: boolean("aggregate_to_family").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Transações (Saídas de dinheiro/Despesas) - SEMPRE NEGATIVO
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id),
  expenseTypeId: integer("expense_type_id").notNull().references(() => expenseTypes.id),
  expenseCategoryId: integer("expense_category_id").notNull().references(() => expenseCategories.id),
  accountId: integer("account_id").references(() => accounts.id),
  aggregateToFamily: boolean("aggregate_to_family").notNull().default(true),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  
  // Para despesas parceladas
  installmentNumber: integer("installment_number"),
  totalInstallments: integer("total_installments"),
  parentTransactionId: integer("parent_transaction_id"),
  
  // Para despesas recorrentes (fixas)
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceEndDate: timestamp("recurrence_end_date"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orçamentos mensais por categoria
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  expenseCategoryId: integer("expense_category_id").notNull().references(() => expenseCategories.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
});

// Insert Schemas
export const insertFamilySchema = createInsertSchema(families).omit({ id: true, createdAt: true });
export const insertMemberSchema = createInsertSchema(members).omit({ id: true, createdAt: true });
export const insertIncomeTypeSchema = createInsertSchema(incomeTypes).omit({ id: true });
export const insertExpenseTypeSchema = createInsertSchema(expenseTypes).omit({ id: true });
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true });
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true });
export const insertMovementSchema = createInsertSchema(movements).omit({ id: true, createdAt: true }).extend({
  accountId: z.number().nullable().optional(),
  incomeCategoryId: z.number().nullable().optional(),
});
export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  accountId: z.number().nullable().optional(),
  installmentNumber: z.number().nullable().optional(),
  totalInstallments: z.number().nullable().optional(),
  parentTransactionId: z.number().nullable().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceEndDate: z.date().nullable().optional(),
});
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });

// Types
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertIncomeType = z.infer<typeof insertIncomeTypeSchema>;
export type IncomeType = typeof incomeTypes.$inferSelect;

export type InsertExpenseType = z.infer<typeof insertExpenseTypeSchema>;
export type ExpenseType = typeof expenseTypes.$inferSelect;

export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

export type InsertIncomeCategory = z.infer<typeof insertIncomeCategorySchema>;
export type IncomeCategory = typeof incomeCategories.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertMovement = z.infer<typeof insertMovementSchema>;
export type Movement = typeof movements.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
