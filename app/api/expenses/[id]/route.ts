import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

    // Verify ownership before deleting
    const count = await prisma.expense.count({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (count === 0) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    await prisma.expense.delete({
      where: {
        id,
      },
    });

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

    // Verify ownership
    const existing = await prisma.expense.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existing) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    const updateData: any = { ...body };
    if (body.date) {
      updateData.date = new Date(body.date);
    }

    const expense = await prisma.expense.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
