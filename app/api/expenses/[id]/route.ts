import { auth } from "@/lib/auth";
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  exportDB,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getCategoryById,
  isInitialized,
} from "@/lib/sqlite/client";

import { NextResponse } from "next/server";
import { z } from "zod";

const expensePatchSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  categoryId: z.string().min(1).optional(),
  accountId: z.string().optional(), // Added
  note: z.string().optional(),
  type: z.enum(["expense", "income"]).optional(),
});

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const existing = getExpenseById(id);
    if (!existing || existing.userId !== session.user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    deleteExpense(id);

    const newData = exportDB();
    await saveDatabaseFile(newData);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[EXPENSE_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;
    const json = await req.json();
    const body = expensePatchSchema.parse(json);

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const existing = getExpenseById(id);
    if (!existing || existing.userId !== session.user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    // Capture old values for balance sync
    const oldAmount = existing.amount;
    const oldType = existing.type;
    const oldAccountId = existing.accountId;

    const updateData: any = { ...body };
    if (body.date) {
      updateData.date = new Date(body.date);
    }

    const mergedExpense = {
      ...existing,
      ...updateData,
    };

    // Update in SQLite with balance sync logic
    updateExpense(mergedExpense, oldAmount, oldType, oldAccountId);

    const newData = exportDB();
    await saveDatabaseFile(newData);

    const categoryId = mergedExpense.categoryId;
    const category = getCategoryById(categoryId);

    return NextResponse.json({ ...mergedExpense, category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
