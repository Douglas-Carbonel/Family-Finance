import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertAccountSchema, insertTransactionSchema, insertMemberSchema, insertBudgetSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Members
  app.get("/api/members", async (_req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const result = insertMemberSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const member = await storage.createMember(result.data);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const result = insertCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const category = await storage.createCategory(result.data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Accounts
  app.get("/api/accounts", async (_req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const result = insertAccountSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const account = await storage.createAccount(result.data);
      res.status(201).json(account);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.categoryId) {
        filters.categoryId = parseInt(req.query.categoryId as string);
      }
      if (req.query.accountId) {
        filters.accountId = parseInt(req.query.accountId as string);
      }
      if (req.query.memberId) {
        filters.memberId = parseInt(req.query.memberId as string);
      }
      if (req.query.type) {
        filters.type = req.query.type;
      }
      if (req.query.recurrenceType) {
        filters.recurrenceType = req.query.recurrenceType;
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const transactions = await storage.getTransactions(filters);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { totalInstallments, ...transactionData } = req.body;
      
      const result = insertTransactionSchema.safeParse(transactionData);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      
      // If it's an installment transaction, create all installments
      if (result.data.recurrenceType === "installment" && totalInstallments > 1) {
        const transactions = await storage.createInstallmentTransactions(result.data, totalInstallments);
        res.status(201).json(transactions);
      } else {
        const transaction = await storage.createTransaction(result.data);
        res.status(201).json(transaction);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTransaction(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Budgets
  app.get("/api/budgets", async (req, res) => {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const budgets = await storage.getBudgets(month, year);
      res.json(budgets);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/budgets", async (req, res) => {
    try {
      const result = insertBudgetSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const budget = await storage.createBudget(result.data);
      res.status(201).json(budget);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const transactions = await storage.getTransactions({
        startDate,
        endDate
      });
      
      const members = await storage.getMembers();
      const categories = await storage.getCategories();
      
      // Calculate totals
      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + parseFloat(t.amount as string), 0);
      
      const totalExpense = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + parseFloat(t.amount as string), 0);
      
      // Income by member
      const incomeByMember = members.map(member => ({
        member,
        total: transactions
          .filter(t => t.type === "income" && t.memberId === member.id)
          .reduce((acc, t) => acc + parseFloat(t.amount as string), 0)
      }));
      
      // Expenses by category
      const expensesByCategory = categories
        .filter(c => c.type === "expense")
        .map(category => ({
          category,
          total: transactions
            .filter(t => t.categoryId === category.id && t.type === "expense")
            .reduce((acc, t) => acc + parseFloat(t.amount as string), 0)
        }))
        .filter(item => item.total > 0);
      
      // Fixed vs Variable expenses
      const fixedExpenses = transactions
        .filter(t => t.type === "expense" && t.recurrenceType === "fixed")
        .reduce((acc, t) => acc + parseFloat(t.amount as string), 0);
      
      const installmentExpenses = transactions
        .filter(t => t.type === "expense" && t.recurrenceType === "installment")
        .reduce((acc, t) => acc + parseFloat(t.amount as string), 0);
      
      const oneTimeExpenses = transactions
        .filter(t => t.type === "expense" && t.recurrenceType === "one_time")
        .reduce((acc, t) => acc + parseFloat(t.amount as string), 0);
      
      res.json({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        incomeByMember,
        expensesByCategory,
        expensesByType: {
          fixed: fixedExpenses,
          installment: installmentExpenses,
          oneTime: oneTimeExpenses
        }
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
