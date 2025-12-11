import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { 
  insertFamilySchema,
  insertMemberSchema, 
  insertIncomeTypeSchema,
  insertExpenseTypeSchema,
  insertExpenseCategorySchema,
  insertIncomeCategorySchema,
  insertAccountSchema, 
  insertMovementSchema,
  insertTransactionSchema, 
  insertBudgetSchema 
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Families
  app.get("/api/families", async (_req, res) => {
    try {
      const families = await storage.getFamilies();
      res.json(families);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/families", async (req, res) => {
    try {
      const result = insertFamilySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const family = await storage.createFamily(result.data);
      res.status(201).json(family);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

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

  app.patch("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const member = await storage.updateMember(id, req.body);
      if (!member) {
        return res.status(404).json({ message: "Membro não encontrado" });
      }
      res.json(member);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Income Types
  app.get("/api/income-types", async (_req, res) => {
    try {
      const incomeTypes = await storage.getIncomeTypes();
      res.json(incomeTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/income-types", async (req, res) => {
    try {
      const result = insertIncomeTypeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const incomeType = await storage.createIncomeType(result.data);
      res.status(201).json(incomeType);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Expense Types
  app.get("/api/expense-types", async (_req, res) => {
    try {
      const expenseTypes = await storage.getExpenseTypes();
      res.json(expenseTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expense-types", async (req, res) => {
    try {
      const result = insertExpenseTypeSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const expenseType = await storage.createExpenseType(result.data);
      res.status(201).json(expenseType);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Expense Categories
  app.get("/api/expense-categories", async (_req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/expense-categories", async (req, res) => {
    try {
      const result = insertExpenseCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const category = await storage.createExpenseCategory(result.data);
      res.status(201).json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Income Categories
  app.get("/api/income-categories", async (_req, res) => {
    try {
      const categories = await storage.getIncomeCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/income-categories", async (req, res) => {
    try {
      const result = insertIncomeCategorySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const category = await storage.createIncomeCategory(result.data);
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

  // Movements (Income entries)
  app.get("/api/movements", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.memberId) {
        filters.memberId = parseInt(req.query.memberId as string);
      }
      if (req.query.incomeTypeId) {
        filters.incomeTypeId = parseInt(req.query.incomeTypeId as string);
      }
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const movements = await storage.getMovements(filters);
      res.json(movements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/movements", async (req, res) => {
    try {
      const result = insertMovementSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromZodError(result.error).message });
      }
      const movement = await storage.createMovement(result.data);
      res.status(201).json(movement);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/movements/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMovement(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transactions (Expense entries)
  app.get("/api/transactions", async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.memberId) {
        filters.memberId = parseInt(req.query.memberId as string);
      }
      if (req.query.expenseTypeId) {
        filters.expenseTypeId = parseInt(req.query.expenseTypeId as string);
      }
      if (req.query.expenseCategoryId) {
        filters.expenseCategoryId = parseInt(req.query.expenseCategoryId as string);
      }
      if (req.query.accountId) {
        filters.accountId = parseInt(req.query.accountId as string);
      }
      if (req.query.status) {
        filters.status = req.query.status;
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
      if (totalInstallments && totalInstallments > 1) {
        const transactions = await storage.createInstallmentTransactions(result.data, totalInstallments);
        return res.status(201).json(transactions);
      }
      
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const transaction = await storage.updateTransactionStatus(id, status);
      if (!transaction) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }
      res.json(transaction);
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

  app.patch("/api/budgets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { amount } = req.body;
      const budget = await storage.updateBudget(id, amount);
      if (!budget) {
        return res.status(404).json({ message: "Orçamento não encontrado" });
      }
      res.json(budget);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Dashboard Summary
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const [movements, transactions] = await Promise.all([
        storage.getMovements({ startDate: startOfMonth, endDate: endOfMonth }),
        storage.getTransactions({ startDate: startOfMonth, endDate: endOfMonth })
      ]);

      const totalIncome = movements.reduce((sum, m) => sum + parseFloat(m.amount), 0);
      const totalExpenses = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const balance = totalIncome - totalExpenses;

      res.json({
        totalIncome,
        totalExpenses,
        balance,
        movementsCount: movements.length,
        transactionsCount: transactions.length
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
