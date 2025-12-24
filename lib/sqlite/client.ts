import initSqlJs, { Database } from "sql.js";
import fs from "fs";
import path from "path";

// Define Schema Types locally since we removed them from Prisma
export interface Category {
  id: string;
  userId: string;
  label: string;
  icon: string;
  color: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: string; // 'cash' | 'bank' | 'card' | 'invest'
  balance: number;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  note: string | null;
  categoryId: string;
  accountId: string; // Added field
  type: string;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  account?: Account;
}

let dbInstance: Database | null = null;
let SQL: any = null;

export function isInitialized() {
  return !!dbInstance;
}

export async function initDB(data?: Uint8Array): Promise<Database> {
  if (dbInstance) {
    if (data) {
      dbInstance.close();
      dbInstance = null;
    } else {
      return dbInstance;
    }
  }

  if (!SQL) {
    // Load WASM from public directory
    const wasmPath = path.join(
      process.cwd(),
      "public",
      "wasm",
      "sql-wasm.wasm"
    );
    const buffer = fs.readFileSync(wasmPath);
    // Cast to any to avoid TS mismatch between Node Buffer and WASM ArrayBuffer expectation
    const wasmBinary = buffer as any;

    SQL = await initSqlJs({
      wasmBinary,
    });
  }

  if (data) {
    dbInstance = new SQL.Database(data);
  } else {
    // Create new empty DB
    dbInstance = new SQL.Database();
  }

  // Define Schema
  dbInstance!.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      categoryId TEXT NOT NULL,
      accountId TEXT, -- Added
      type TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      label TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      parentId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance INTEGER NOT NULL DEFAULT 0,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_userId ON expenses(userId);
    CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_category ON expenses(categoryId);
    CREATE INDEX IF NOT EXISTS idx_cat_userId ON categories(userId);
    CREATE INDEX IF NOT EXISTS idx_acc_userId ON accounts(userId);
  `);

  // Migration: Add columns to expenses if they don't exist
  try {
    dbInstance!.run("ALTER TABLE expenses ADD COLUMN accountId TEXT");
  } catch (e) {}
  try {
    // Ensure type column exists (might be missing if migrating from very old schema)
    dbInstance!.run(
      "ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'expense'"
    );
  } catch (e) {}

  // Ensure all rows have valid accountId and type
  dbInstance!.run(`
    UPDATE expenses 
    SET accountId = 'cash' 
    WHERE accountId IS NULL OR accountId = ''
  `);
  dbInstance!.run(`
    UPDATE expenses 
    SET type = 'expense' 
    WHERE type IS NULL OR type = ''
  `);

  // Seed default categories if empty
  const checkStmt = dbInstance!.prepare("SELECT COUNT(*) FROM categories");
  if (checkStmt.step()) {
    const count = checkStmt.get()[0] as number;
    if (count === 0) {
      // Seed defaults
      const defaults = [
        {
          id: "food",
          label: "Food",
          icon: "🍔",
          color: "bg-orange-100 text-orange-600",
        },
        {
          id: "lunch",
          label: "Lunch",
          icon: "🍱",
          color: "bg-orange-50 text-orange-500",
          parentId: "food",
        },
        {
          id: "dinner",
          label: "Dinner",
          icon: "🍽️",
          color: "bg-orange-50 text-orange-500",
          parentId: "food",
        },
        {
          id: "cafe",
          label: "Cafe",
          icon: "☕",
          color: "bg-orange-50 text-orange-500",
          parentId: "food",
        },
        {
          id: "grocery",
          label: "Grocery",
          icon: "🥦",
          color: "bg-orange-50 text-orange-500",
          parentId: "food",
        },
        {
          id: "transport",
          label: "Transport",
          icon: "🚕",
          color: "bg-blue-100 text-blue-600",
        },
        {
          id: "train",
          label: "Train",
          icon: "🚃",
          color: "bg-blue-50 text-blue-500",
          parentId: "transport",
        },
        {
          id: "taxi",
          label: "Taxi",
          icon: "🚕",
          color: "bg-blue-50 text-blue-500",
          parentId: "transport",
        },
        {
          id: "daily",
          label: "Daily",
          icon: "🧻",
          color: "bg-green-100 text-green-600",
        },
        {
          id: "ent",
          label: "Entertain",
          icon: "🎮",
          color: "bg-purple-100 text-purple-600",
        },
      ];

      const now = new Date().toISOString();
      defaults.forEach((c) => {
        dbInstance!.run(
          `INSERT INTO categories (id, userId, label, icon, color, parentId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c.id,
            "system",
            c.label,
            c.icon,
            c.color,
            c.parentId || null,
            now,
            now,
          ]
        );
      });
    }
  }
  checkStmt.free();

  // Seed default accounts if empty
  const accountCheck = dbInstance!.prepare("SELECT COUNT(*) FROM accounts");
  if (accountCheck.step()) {
    const count = accountCheck.get()[0] as number;
    if (count === 0) {
      const now = new Date().toISOString();
      const defaultAccounts = [
        {
          id: "cash",
          name: "財布",
          type: "cash",
          balance: 0,
          icon: "💵",
          color: "bg-green-100 text-green-600",
        },
        {
          id: "bank",
          name: "銀行口座",
          type: "bank",
          balance: 0,
          icon: "🏦",
          color: "bg-blue-100 text-blue-600",
        },
      ];

      defaultAccounts.forEach((a) => {
        dbInstance!.run(
          `INSERT INTO accounts (id, userId, name, type, balance, icon, color, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [a.id, "system", a.name, a.type, a.balance, a.icon, a.color, now, now]
        );
      });
    }
  }
  accountCheck.free();

  // --- Data Synchronization & Recalculation ---
  // 1. Link legacy expenses (missing accountId) to the default 'cash' account
  dbInstance!.run(
    "UPDATE expenses SET accountId = 'cash' WHERE accountId IS NULL OR accountId = ''"
  );

  // 2. Perform a full balance synchronization
  syncAccountBalancesInternal();

  return dbInstance!;
}

/**
 * Recalculates all account balances based on transaction history.
 * This ensures consistency even if manual edits or bugs caused drifts.
 */
function syncAccountBalancesInternal() {
  if (!dbInstance) return;

  // Reset all account balances to 0 first (legacy/orphan check)
  dbInstance.run("UPDATE accounts SET balance = 0");

  // Aggregate totals from expenses (using LOWER for case-insensitivity)
  const result = dbInstance.exec(`
    SELECT accountId, 
           SUM(CASE WHEN LOWER(type) = 'income' THEN amount ELSE -amount END) as net_balance
    FROM expenses
    WHERE accountId IS NOT NULL AND accountId != ''
    GROUP BY accountId
  `);

  if (result.length > 0) {
    const rows = result[0].values;
    rows.forEach((row) => {
      const accountId = row[0] as string;
      const balance = row[1] as number;
      dbInstance!.run(
        "UPDATE accounts SET balance = ?, updatedAt = ? WHERE id = ?",
        [balance, new Date().toISOString(), accountId]
      );
    });
  }
}

export function exportDB(): Uint8Array {
  if (!dbInstance) throw new Error("Database not initialized");
  return dbInstance.export();
}

/**
 * Helpers
 */
function rowToCategory(row: any[]): Category {
  return {
    id: row[0] as string,
    userId: row[1] as string,
    label: row[2] as string,
    icon: row[3] as string,
    color: row[4] as string,
    parentId: row[5] as string | null,
    createdAt: new Date(row[6] as string),
    updatedAt: new Date(row[7] as string),
  };
}

function rowToAccount(row: any[]): Account {
  return {
    id: row[0] as string,
    userId: row[1] as string,
    name: row[2] as string,
    type: row[3] as string,
    balance: row[4] as number,
    icon: row[5] as string,
    color: row[6] as string,
    createdAt: new Date(row[7] as string),
    updatedAt: new Date(row[8] as string),
  };
}

function rowToExpense(row: any[]): Expense {
  return {
    id: row[0] as string,
    userId: row[1] as string,
    amount: row[2] as number,
    date: new Date(row[3] as string),
    note: row[4] as string | null,
    categoryId: row[5] as string,
    accountId: row[6] as string,
    type: row[7] as string,
    createdAt: new Date(row[8] as string),
    updatedAt: new Date(row[9] as string),
  };
}

// --- Category Operations ---

export function getCategories(userId: string): Category[] {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare(
    "SELECT * FROM categories WHERE userId = ? OR userId = 'system' ORDER BY createdAt ASC"
  );
  stmt.bind([userId]);

  const categories: Category[] = [];
  while (stmt.step()) {
    categories.push(rowToCategory(stmt.get()));
  }
  stmt.free();
  return categories;
}

export function getCategoryById(id: string): Category | null {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare("SELECT * FROM categories WHERE id = ?");
  stmt.bind([id]);

  if (stmt.step()) {
    const category = rowToCategory(stmt.get());
    stmt.free();
    return category;
  }
  stmt.free();
  return null;
}

export function createCategory(category: Category) {
  if (!dbInstance) throw new Error("DB not init");
  const createdAtStr = category.createdAt.toISOString();
  const updatedAtStr = category.updatedAt.toISOString();

  dbInstance.run(
    `INSERT INTO categories (id, userId, label, icon, color, parentId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      category.id,
      category.userId,
      category.label,
      category.icon,
      category.color,
      category.parentId || null,
      createdAtStr,
      updatedAtStr,
    ]
  );
}

// --- Account Operations ---

export function getAccounts(userId: string): Account[] {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare(
    "SELECT * FROM accounts WHERE userId = ? OR userId = 'system' ORDER BY createdAt ASC"
  );
  stmt.bind([userId]);

  const accounts: Account[] = [];
  while (stmt.step()) {
    accounts.push(rowToAccount(stmt.get()));
  }
  stmt.free();
  return accounts;
}

export function createAccount(account: Account) {
  if (!dbInstance) throw new Error("DB not init");
  const now = account.createdAt.toISOString();
  dbInstance.run(
    `INSERT INTO accounts (id, userId, name, type, balance, icon, color, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      account.id,
      account.userId,
      account.name,
      account.type,
      account.balance,
      account.icon,
      account.color,
      now,
      now,
    ]
  );
}

export function updateAccountBalance(id: string, diff: number) {
  if (!dbInstance) throw new Error("DB not init");
  dbInstance.run(
    "UPDATE accounts SET balance = balance + ?, updatedAt = ? WHERE id = ?",
    [diff, new Date().toISOString(), id]
  );
}

// --- Expense Operations ---

export function getExpenses(userId: string): Expense[] {
  if (!dbInstance) throw new Error("DB not init");
  // Join with categories and accounts
  // Explicitly list expense columns to avoid order issues from ALTER TABLE
  const stmt = dbInstance.prepare(`
    SELECT e.id, e.userId, e.amount, e.date, e.note, e.categoryId, e.accountId, e.type, e.createdAt, e.updatedAt, 
           c.id, c.userId, c.label, c.icon, c.color, c.parentId, c.createdAt, c.updatedAt,
           a.id, a.userId, a.name, a.type, a.balance, a.icon, a.color, a.createdAt, a.updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.categoryId = c.id
    LEFT JOIN accounts a ON e.accountId = a.id
    WHERE e.userId = ? 
    ORDER BY e.date DESC
  `);
  stmt.bind([userId]);

  const expenses: Expense[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    // Expense columns: 0-9
    const expenseRow = row.slice(0, 10);
    const expense = rowToExpense(expenseRow);

    // Category columns: 10-17
    if (row[10]) {
      const categoryRow = row.slice(10, 18);
      expense.category = rowToCategory(categoryRow);
    }

    // Account columns: 18-26
    if (row[18]) {
      const accountRow = row.slice(18, 27);
      expense.account = rowToAccount(accountRow);
    }

    expenses.push(expense);
  }
  stmt.free();
  return expenses;
}

export function getExpenseById(id: string): Expense | null {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare(`
    SELECT id, userId, amount, date, note, categoryId, accountId, type, createdAt, updatedAt 
    FROM expenses 
    WHERE id = ?
  `);
  stmt.bind([id]);

  if (stmt.step()) {
    const expense = rowToExpense(stmt.get());
    stmt.free();
    return expense;
  }
  stmt.free();
  return null;
}

export function createExpense(expense: Expense) {
  if (!dbInstance) throw new Error("DB not init");

  // Convert Dates to ISO strings
  const dateStr = expense.date.toISOString();
  const createdAtStr = expense.createdAt.toISOString();
  const updatedAtStr = expense.updatedAt.toISOString();

  dbInstance.run(
    `INSERT INTO expenses (id, userId, amount, date, note, categoryId, accountId, type, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.userId,
      expense.amount,
      dateStr,
      expense.note,
      expense.categoryId,
      expense.accountId,
      expense.type,
      createdAtStr,
      updatedAtStr,
    ]
  );

  // Update account balance
  const diff = expense.type === "income" ? expense.amount : -expense.amount;
  if (expense.accountId) {
    updateAccountBalance(expense.accountId, diff);
  }
}

export function updateExpense(
  expense: Expense,
  oldAmount: number,
  oldType: string,
  oldAccountId: string
) {
  if (!dbInstance) throw new Error("DB not init");

  const dateStr = expense.date.toISOString();
  const updatedAtStr = new Date().toISOString();

  dbInstance.run(
    `UPDATE expenses 
     SET amount = ?, date = ?, note = ?, categoryId = ?, accountId = ?, type = ?, updatedAt = ?
     WHERE id = ?`,
    [
      expense.amount,
      dateStr,
      expense.note,
      expense.categoryId,
      expense.accountId,
      expense.type,
      updatedAtStr,
      expense.id,
    ]
  );

  // Revert old account balance
  const oldDiff = oldType === "income" ? oldAmount : -oldAmount;
  if (oldAccountId) {
    updateAccountBalance(oldAccountId, -oldDiff);
  }

  // Apply new account balance
  const newDiff = expense.type === "income" ? expense.amount : -expense.amount;
  if (expense.accountId) {
    updateAccountBalance(expense.accountId, newDiff);
  }
}

export function deleteExpense(id: string) {
  if (!dbInstance) throw new Error("DB not init");

  // Get expense details for balance revert
  const expense = getExpenseById(id);
  if (expense) {
    const diff = expense.type === "income" ? expense.amount : -expense.amount;
    if (expense.accountId) {
      updateAccountBalance(expense.accountId, -diff);
    }
  }

  dbInstance.run("DELETE FROM expenses WHERE id = ?", [id]);
}

export function getExpensesByDateRange(
  userId: string,
  start: Date,
  end: Date
): Expense[] {
  if (!dbInstance) throw new Error("DB not init");
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  const stmt = dbInstance.prepare(`
    SELECT id, userId, amount, date, note, categoryId, accountId, type, createdAt, updatedAt 
    FROM expenses 
    WHERE userId = ? AND date >= ? AND date <= ?
  `);
  stmt.bind([userId, startStr, endStr]);

  const results: Expense[] = [];
  while (stmt.step()) {
    results.push(rowToExpense(stmt.get()));
  }
  stmt.free();
  return results;
}

export function getAllExpensesForAssets(
  userId: string
): { type: string; total: number }[] {
  if (!dbInstance) throw new Error("DB not init");
  // Aggregate directly in SQL
  const result = dbInstance.exec(`
    SELECT type, SUM(amount) as total 
    FROM expenses 
    WHERE userId = '${userId}' 
    GROUP BY type
  `);

  if (result.length === 0) return [];

  const rows = result[0].values;
  return rows.map((r) => ({
    type: r[0] as string,
    total: r[1] as number,
  }));
}

export function getTotalAssets(userId: string): number {
  if (!dbInstance) throw new Error("DB not init");
  const result = dbInstance.exec(`
    SELECT SUM(balance) FROM accounts 
    WHERE userId = '${userId}' OR userId = 'system'
  `);
  if (result.length === 0 || !result[0].values[0][0]) return 0;
  return result[0].values[0][0] as number;
}
