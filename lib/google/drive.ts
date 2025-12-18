import { google } from "googleapis";
import { auth } from "@/lib/auth";

const FOLDER_NAME = "AI_Kakeibo_Data";

export async function getDriveClient() {
  const session = await auth();

  // @ts-expect-error session extended with tokens
  const accessToken = session?.accessToken;
  // @ts-expect-error session extended with tokens
  const refreshToken = session?.refreshToken;

  if (!session?.user?.id || !accessToken) {
    throw new Error("Not authenticated or missing access token");
  }

  const authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  authClient.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
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
