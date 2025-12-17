import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db"; // Still needed for Category? Yes, we fetch categories from Postgres.
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  exportDB,
  getExpenses,
  createExpense,
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

    // 1. Fetch DB File and Init
    const fileData = await fetchDatabaseFile();
    await initDB(fileData || undefined);

    // 2. Query Expenses (SQLite)
    // Note: getExpenses currently fetches ALL for user.
    // We can optimize strict SQL pagination later, for now memory is fine for MVP.
    const allExpenses = getExpenses(session.user.id);

    // 3. Fetch all categories from Postgres (needed for join)
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
    });

    // 4. Manual Join & Pagination
    const joinedExpenses = allExpenses.map((e) => {
      const category = categories.find((c) => c.id === e.categoryId) || null;
      // @ts-expect-error - Manual join for response
      return { ...e, category };
    });

    // Already sorted by date desc in getExpenses SQL
    const paginatedExpenses = joinedExpenses.slice(offset, offset + limit);

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

    // Ensure date is a DateTime object (helper will convert to string)
    const date = new Date(body.date);

    // 1. Fetch & Init
    const fileData = await fetchDatabaseFile();
    await initDB(fileData || undefined);

    // 2. Create Object
    const newExpense = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      amount: body.amount,
      date: date,
      categoryId: body.categoryId,
      note: body.note ?? null,
      type: body.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 3. Insert into SQLite
    createExpense(newExpense);

    // 4. Export & Save
    const newData = exportDB();
    await saveDatabaseFile(newData);

    // 5. Fetch Category for response
    const category = await prisma.category.findUnique({
      where: { id: body.categoryId },
    });

    return NextResponse.json({ ...newExpense, category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
