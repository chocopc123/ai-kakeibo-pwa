import initSqlJs, { Database, QueryExecResult } from "sql.js";
import { Expense } from "@prisma/client";

let dbInstance: Database | null = null;
let SQL: any = null;

export async function initDB(data?: Uint8Array): Promise<Database> {
  if (dbInstance) {
    // If data is provided, strict reload might be needed, but for now assuming per-request lifecycle or singleton reuse
    // If we want to force reload with new data:
    if (data) {
      dbInstance.close();
      dbInstance = null;
    } else {
      return dbInstance;
    }
  }

  if (!SQL) {
    SQL = await initSqlJs();
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
    
    CREATE INDEX IF NOT EXISTS idx_userId ON expenses(userId);
    CREATE INDEX IF NOT EXISTS idx_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_category ON expenses(categoryId);
  `);

  return dbInstance!;
}

export function exportDB(): Uint8Array {
  if (!dbInstance) {
    throw new Error("Database not initialized");
  }
  return dbInstance.export();
}

/**
 * Helper to convert SQL result row to Expense object
 */
function rowToExpense(row: any[]): Expense {
  // Ordered as per CREATE TABLE or SELECT * columns
  // id, userId, amount, date, note, categoryId, type, createdAt, updatedAt
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
  };
}

export function getExpenses(userId: string): Expense[] {
  if (!dbInstance) throw new Error("DB not init");
  const stmt = dbInstance.prepare(
    "SELECT * FROM expenses WHERE userId = ? ORDER BY date DESC"
  );
  stmt.bind([userId]);

  const expenses: Expense[] = [];
  while (stmt.step()) {
    expenses.push(rowToExpense(stmt.get()));
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
    `
    INSERT INTO expenses (id, userId, amount, date, note, categoryId, type, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
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
    `
    UPDATE expenses 
    SET amount = ?, date = ?, note = ?, categoryId = ?, type = ?, updatedAt = ?
    WHERE id = ?
  `,
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
