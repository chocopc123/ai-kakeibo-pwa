import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  exportDB,
  getExpenseById,
  updateExpense,
  deleteExpense,
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

    // 1. Fetch & Init
    const fileData = await fetchDatabaseFile();
    await initDB(fileData || undefined);

    // 2. Check Existence & Ownership
    const existing = getExpenseById(id);
    if (!existing || existing.userId !== session.user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    // 3. Delete
    deleteExpense(id);

    // 4. Save
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

    // 1. Fetch & Init
    const fileData = await fetchDatabaseFile();
    await initDB(fileData || undefined);

    // 2. Check Existence & Ownership
    const existing = getExpenseById(id);
    if (!existing || existing.userId !== session.user.id) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    // 3. Prepare Update
    const updateData: any = { ...body };
    if (body.date) {
      updateData.date = new Date(body.date);
    }

    // Merge existing with updates locally to pass to updateExpense helper
    const mergedExpense = {
      ...existing,
      ...updateData,
    };

    // 4. Update in SQLite
    updateExpense(mergedExpense);

    // 5. Save
    const newData = exportDB();
    await saveDatabaseFile(newData);

    // 6. Fetch Category for response
    // If categoryId changed, we fetch the new one, otherwise the old one
    const categoryId = mergedExpense.categoryId;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    return NextResponse.json({ ...mergedExpense, category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
