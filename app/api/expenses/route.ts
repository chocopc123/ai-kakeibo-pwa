import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for input validation
const expenseSchema = z.object({
  amount: z.coerce.number().positive(),
  date: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), // Allow ISO or YYYY-MM-DD
  categoryId: z.string().min(1),
  note: z.string().optional(),
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

    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: "desc",
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(expenses);
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

    // Ensure date is a DateTime object
    const date = new Date(body.date);

    const expense = await prisma.expense.create({
      data: {
        userId: session.user.id,
        amount: body.amount,
        date: date,
        categoryId: body.categoryId,
        note: body.note,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
