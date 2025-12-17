import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

    // Get current month's expenses and income
    const monthlyStats = await prisma.expense.groupBy({
      by: ["type"],
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get all-time stats for Total Assets
    const allTimeStats = await prisma.expense.groupBy({
      by: ["type"],
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
    });

    const getSum = (stats: any[], type: string) =>
      stats.find((s) => s.type === type)?._sum.amount || 0;

    const monthlyExpense = getSum(monthlyStats, "expense");
    const monthlyIncome = getSum(monthlyStats, "income");

    const totalExpense = getSum(allTimeStats, "expense");
    const totalIncome = getSum(allTimeStats, "income");

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
