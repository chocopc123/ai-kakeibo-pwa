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
  parentId: string | null;
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
  type: string;
  createdAt: Date;
  updatedAt: Date;
  // Optional joined category
  category?: Category | null;
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
    
    CREATE INDEX IF NOT EXISTS idx_userId ON expenses(userId);
    CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_category ON expenses(categoryId);
    CREATE INDEX IF NOT EXISTS idx_cat_userId ON categories(userId);
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

  return dbInstance!;
}

export function exportDB(): Uint8Array {
  if (!dbInstance) {
    throw new Error("Database not initialized");
  }
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

function rowToExpense(row: any[]): Expense {
  return {
    id: row[0] as string,
    userId: row[1] as string,
    amount: row[2] as number,
    date: new Date(row[3] as string),
    note: row[4] as string | null,
    categoryId: row[5] as string,
    type: row[6] as string,
    createdAt: new Date(row[7] as string),
    updatedAt: new Date(row[8] as string),
    category: undefined,
  };
}

// --- Category Operations ---

export function getCategories(userId: string): Category[] {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare(
    "SELECT * FROM categories WHERE userId = ? ORDER BY createdAt ASC"
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
      category.parentId,
      createdAtStr,
      updatedAtStr,
    ]
  );
}

// --- Expense Operations ---

export function getExpenses(userId: string): Expense[] {
  if (!dbInstance) throw new Error("DB not init");
  // Join with categories to mimic Prisma include
  const stmt = dbInstance.prepare(`
    SELECT e.*, c.id, c.userId, c.label, c.icon, c.color, c.parentId, c.createdAt, c.updatedAt
    FROM expenses e
    LEFT JOIN categories c ON e.categoryId = c.id
    WHERE e.userId = ? 
    ORDER BY e.date DESC
  `);
  stmt.bind([userId]);

  const expenses: Expense[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    // Expense columns: 0-8
    const expenseRow = row.slice(0, 9);
    const expense = rowToExpense(expenseRow);

    // Category columns: 9-16. If c.id (index 9) is not null, we have a category
    if (row[9]) {
      const categoryRow = row.slice(9, 17);
      expense.category = rowToCategory(categoryRow);
    } else {
      expense.category = null;
    }

    expenses.push(expense);
  }
  stmt.free();
  return expenses;
}

export function getExpenseById(id: string): Expense | null {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare("SELECT * FROM expenses WHERE id = ?");
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
    `INSERT INTO expenses (id, userId, amount, date, note, categoryId, type, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      expense.id,
      expense.userId,
      expense.amount,
      dateStr,
      expense.note,
      expense.categoryId,
      expense.type,
      createdAtStr,
      updatedAtStr,
    ]
  );
}

export function updateExpense(expense: Expense) {
  if (!dbInstance) throw new Error("DB not init");

  const dateStr = expense.date.toISOString();
  const updatedAtStr = new Date().toISOString(); // Update timestamp

  dbInstance.run(
    `UPDATE expenses 
     SET amount = ?, date = ?, note = ?, categoryId = ?, type = ?, updatedAt = ?
     WHERE id = ?`,
    [
      expense.amount,
      dateStr,
      expense.note,
      expense.categoryId,
      expense.type,
      updatedAtStr,
      expense.id,
    ]
  );
}

export function deleteExpense(id: string) {
  if (!dbInstance) throw new Error("DB not init");
  dbInstance.run("DELETE FROM expenses WHERE id = ?", [id]);
}

// For Stats
export function getExpensesByDateRange(
  userId: string,
  start: Date,
  end: Date
): Expense[] {
  if (!dbInstance) throw new Error("DB not init");
  const startStr = start.toISOString();
  const endStr = end.toISOString();

  const stmt = dbInstance.prepare(`
    SELECT * FROM expenses 
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
