import { sql } from "drizzle-orm";
import { pgTable, text, integer, decimal, timestamp, varchar, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Membros da família
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(), // Cor para identificação visual
});

// Categorias de transações
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'income' or 'expense'
  color: varchar("color", { length: 7 }).notNull(),
});

// Contas bancárias/carteiras
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'checking', 'credit', 'savings', 'cash', 'food_voucher', 'other'
  initialBalance: decimal("initial_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  memberId: integer("member_id").references(() => members.id), // Opcional: conta vinculada a um membro
});

// Transações (despesas e rendas)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  memberId: integer("member_id").references(() => members.id), // Quem realizou/recebeu
  type: varchar("type", { length: 20 }).notNull(), // 'income' or 'expense'
  
  // Tipo de recorrência
  recurrenceType: varchar("recurrence_type", { length: 20 }).notNull().default("one_time"), 
  // 'one_time' = avulsa, 'fixed' = fixa mensal, 'installment' = parcelada
  
  // Para despesas parceladas
  installmentNumber: integer("installment_number"), // Número desta parcela (1, 2, 3...)
  totalInstallments: integer("total_installments"), // Total de parcelas
  parentTransactionId: integer("parent_transaction_id"), // ID da transação "mãe" para parcelas
  
  // Para despesas fixas
  isActive: boolean("is_active").notNull().default(true), // Para pausar/cancelar recorrências
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orçamentos mensais por categoria
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
});

// Insert Schemas
export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  memberId: z.number().nullable().optional(),
  installmentNumber: z.number().nullable().optional(),
  totalInstallments: z.number().nullable().optional(),
  parentTransactionId: z.number().nullable().optional(),
});
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true });

// Types
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof members.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgets.$inferSelect;
