import { auth } from "@/lib/auth";
import { fetchDatabaseFile, saveDatabaseFile } from "@/lib/google/storage";
import {
  initDB,
  getAccounts,
  createAccount,
  exportDB,
  isInitialized,
} from "@/lib/sqlite/client";
import { NextResponse } from "next/server";

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

    const accounts = getAccounts(session.user.id);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error("[ACCOUNTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, type, balance, icon, color } = body;

    if (!isInitialized()) {
      const fileData = await fetchDatabaseFile();
      await initDB(fileData || undefined);
    }

    const newAccount = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      name,
      type,
      balance: balance || 0,
      icon,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    createAccount(newAccount);

    // Save to Google Drive
    const updatedDb = exportDB();
    await saveDatabaseFile(updatedDb);

    return NextResponse.json(newAccount);
  } catch (error) {
    console.error("[ACCOUNTS_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
