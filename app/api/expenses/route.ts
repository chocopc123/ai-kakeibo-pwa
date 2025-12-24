import { auth } from "@/lib/auth";
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";

import {
  initDB,
  exportDB,
  getExpenses,
  createExpense,
  isInitialized,
} from "@/lib/sqlite/client";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for input validation
const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  categoryId: z.string().min(1),
  accountId: z.string().optional(), // Added
  note: z.string().optional(),
  type: z.enum(["expense", "income"]).optional().default("expense"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const allExpenses = getExpenses(session.user.id);

    // 3. Manual Pagination (Memory based)
    const paginatedExpenses = allExpenses.slice(offset, offset + limit);

    return NextResponse.json(paginatedExpenses);
  } catch (error) {
    console.error("[EXPENSES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = expenseSchema.parse(json);

    const date = new Date(body.date);

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const newExpense: any = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: body.amount,
      date: date,
      categoryId: body.categoryId,
      accountId: body.accountId || null, // Added
      note: body.note ?? null,
      type: body.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createExpense(newExpense);

    const newData = exportDB();
    await saveDatabaseFile(newData);

    const createdWithCategory = getExpenses(session.user.id).find(
      (e) => e.id === newExpense.id
    );

    return NextResponse.json(createdWithCategory || newExpense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
