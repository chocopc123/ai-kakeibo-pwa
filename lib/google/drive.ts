import { google } from "googleapis";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const FOLDER_NAME = "AI_Kakeibo_Data";

export async function getDriveClient() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  // データベースからGoogleアカウントのアクセストークンを取得
  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: "google",
    },
  });

  if (!account?.access_token) {
    throw new Error("No Google account linked or access token missing");
  }

  // Note: 本番環境ではrefresh_tokenを使ってアクセストークンを更新する処理が必要
  // googleapisは自動でリフレッシュしてくれる場合もあるが、
  // setCredentialsでrefresh_tokenも渡す必要がある

  const authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  authClient.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token, // リフレッシュトークンもあれば設定
  });

  return google.drive({ version: "v3", auth: authClient });
}

export async function getOrCreateDataFolder(drive: any) {
  const res = await drive.files.list({
    q: `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }

  const folderMetadata = {
    name: FOLDER_NAME,
    mimeType: "application/vnd.google-apps.folder",
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
}
