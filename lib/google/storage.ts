import { getDriveClient, getOrCreateDataFolder } from "./drive";
import { Readable } from "stream";

const FILE_NAME = "kakeibo.sqlite";

async function getFileId(drive: any, folderId: string): Promise<string | null> {
  const query = `name = '${FILE_NAME}' and '${folderId}' in parents and trashed = false`;
  const res = await drive.files.list({
    q: query,
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }
  return null;
}

export async function fetchDatabaseFile(): Promise<Uint8Array | null> {
  const drive = await getDriveClient();
  const folderId = await getOrCreateDataFolder(drive);
  const fileId = await getFileId(drive, folderId);

  if (!fileId) {
    return null;
  }

  try {
    const res = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "arraybuffer", // Important for binary
      }
    );

    return new Uint8Array(res.data);
  } catch (error) {
    console.warn("Failed to fetch database file.", error);
    return null;
  }
}

export async function saveDatabaseFile(data: Uint8Array): Promise<void> {
  const drive = await getDriveClient();
  const folderId = await getOrCreateDataFolder(drive);
  const fileId = await getFileId(drive, folderId);

  const fileMetadata = {
    name: FILE_NAME,
    parents: [folderId],
    mimeType: "application/x-sqlite3",
  };

  const media = {
    mimeType: "application/x-sqlite3",
    body: Readable.from(Buffer.from(data)),
  };

  if (fileId) {
    // Update existing file
    await drive.files.update({
      fileId: fileId,
      media: media,
      fields: "id",
    });
  } else {
    // Create new file
    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
  }
}
