import { randomUUID } from "crypto";
import type { ShelbyFile } from "@/lib/shelby";

export type ShelbyLocalObjectResponse = {
  body: Uint8Array;
  contentType: string;
  fileName: string;
};

type ShelbyLocalRecord = ShelbyLocalObjectResponse & {
  file: ShelbyFile;
};

type ShelbyLocalGlobal = typeof globalThis & {
  __shelbyKnowledgeVaultFiles?: Map<string, ShelbyLocalRecord>;
};

const SHELBY_STORAGE_MODE = "Shelby hot storage";
const globalStore = globalThis as ShelbyLocalGlobal;
const localFiles = globalStore.__shelbyKnowledgeVaultFiles ?? new Map<string, ShelbyLocalRecord>();
globalStore.__shelbyKnowledgeVaultFiles = localFiles;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

function createLocalKey(fileName: string) {
  return `local-${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

function cloneFile(file: ShelbyFile): ShelbyFile {
  return { ...file };
}

export async function uploadLocalShelbyObject(file: File): Promise<ShelbyFile> {
  const key = createLocalKey(file.name);
  const contentType = file.type || "application/octet-stream";
  const body = new Uint8Array(await file.arrayBuffer());
  const shelbyFile: ShelbyFile = {
    id: key,
    name: file.name,
    size: file.size,
    type: contentType,
    uploadedAt: new Date().toISOString(),
    storageMode: SHELBY_STORAGE_MODE,
    readCount: 0,
    dataUrl: `/api/files/${encodeURIComponent(key)}`,
  };

  localFiles.set(key, {
    file: shelbyFile,
    body,
    contentType,
    fileName: file.name,
  });

  return cloneFile(shelbyFile);
}

export function listLocalShelbyObjects(): ShelbyFile[] {
  return Array.from(localFiles.values())
    .map((record) => cloneFile(record.file))
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export function getLocalShelbyObject(key: string): ShelbyLocalObjectResponse | null {
  const record = localFiles.get(key);
  if (!record) {
    return null;
  }

  record.file.readCount += 1;

  return {
    body: record.body,
    contentType: record.contentType,
    fileName: record.fileName,
  };
}

export function deleteLocalShelbyObject(key: string): void {
  localFiles.delete(key);
}
