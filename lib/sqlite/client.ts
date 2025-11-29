import initSqlJs, { Database } from "sql.js";

let dbInstance: Database | null = null;

export async function initDB() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs({
    // Next.jsのpublicフォルダからWASMを読み込む
    locateFile: (file) => `/${file}`,
  });

  dbInstance = new SQL.Database();

  // テーブル作成
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      merchant TEXT,
      source TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_category ON transactions(category);
  `);

  return dbInstance;
}

export function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return dbInstance;
}

export function exportDB() {
  const db = getDB();
  return db.export();
}

export function loadDB(data: Uint8Array) {
  // 既存のDBを閉じる
  if (dbInstance) {
    dbInstance.close();
  }

  // 新しいデータをロード（initSqlJsは再呼び出し不要）
  // Note: 実際の実装ではSQL.Database(data)のように初期化する必要があるため
  // ここでは簡易的な実装としています
}
