import { auth } from "@/lib/auth";
import { fetchDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  getExpensesByDateRange,
  getAllExpensesForAssets,
  isInitialized,
} from "@/lib/sqlite/client";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 1. Fetch & Init
    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    // 2. Calculate Monthly Stats
    const monthlyExpenses = getExpensesByDateRange(
      userId,
      startOfMonth,
      endOfMonth
    );

    const monthlyExpense = monthlyExpenses
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyIncome = monthlyExpenses
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + e.amount, 0);

    // 3. Calculate All-time Stats for Total Assets
    const totals = getAllExpensesForAssets(userId);

    // totals is array of { type: string, total: number }
    const totalExpense = totals.find((t) => t.type === "expense")?.total || 0;
    const totalIncome = totals.find((t) => t.type === "income")?.total || 0;

    const totalAssets = totalIncome - totalExpense;

    return NextResponse.json({
      monthlyExpense,
      monthlyIncome,
      totalAssets,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
    });
  } catch (error) {
    console.error("[STATS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
