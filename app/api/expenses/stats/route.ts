import { auth } from "@/lib/auth";
import { fetchDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  getExpensesByDateRange,
  getTotalAssets,
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
    // Start of month (local time)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // End of month (local time, set to late night to include all transactions)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

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
    const totalAssets = getTotalAssets(userId);

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
