import { auth } from "@/lib/auth";
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  exportDB,
  getCategories,
  createCategory,
  isInitialized,
} from "@/lib/sqlite/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const categorySchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  parentId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const categories = getCategories(session.user.id);

    // Also include system categories (those without a userId or with 'system')
    const systemCategories = getCategories("system");

    // Merge them. In a real app we might want to group them or handle duplicates.
    return NextResponse.json([...systemCategories, ...categories]);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
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
    const body = categorySchema.parse(json);

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const newCategory = {
      ...body,
      userId: session.user.id,
      parentId: body.parentId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createCategory(newCategory);

    const newData = exportDB();
    await saveDatabaseFile(newData);

    return NextResponse.json(newCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
