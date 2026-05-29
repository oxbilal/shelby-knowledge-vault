export type ShelbyFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  storageMode: "Shelby hot storage";
  readCount: number;
  dataUrl: string;
};

const SHELBY_STORAGE_KEY = "shelby-knowledge-vault-files";

function isBrowser() {
  return typeof window !== "undefined";
}

function readFiles(): ShelbyFile[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(SHELBY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ShelbyFile[];
  } catch {
    window.localStorage.removeItem(SHELBY_STORAGE_KEY);
    return [];
  }
}

function writeFiles(files: ShelbyFile[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(SHELBY_STORAGE_KEY, JSON.stringify(files));
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `shelby-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function uploadToShelby(file: File): Promise<ShelbyFile> {
  // TODO: Replace this localStorage mock with Shelby S3 Gateway upload logic.
  // Expected real flow: request/create bucket credentials, upload the file object,
  // persist returned object metadata, and use Shelby hot storage URLs for reads.
  const dataUrl = await fileToDataUrl(file);
  const shelbyFile: ShelbyFile = {
    id: createId(),
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    storageMode: "Shelby hot storage",
    readCount: 0,
    dataUrl,
  };

  const files = [shelbyFile, ...readFiles()];
  writeFiles(files);

  return shelbyFile;
}

export async function listShelbyFiles(): Promise<ShelbyFile[]> {
  // TODO: Replace this with Shelby S3 Gateway object listing.
  return readFiles();
}

export async function getShelbyFileUrl(id: string): Promise<string> {
  // TODO: Replace this with a Shelby S3 Gateway signed URL or public read URL.
  const files = readFiles();
  const nextFiles = files.map((file) =>
    file.id === id ? { ...file, readCount: file.readCount + 1 } : file,
  );
  writeFiles(nextFiles);

  const match = nextFiles.find((file) => file.id === id);
  if (!match) {
    throw new Error("Shelby file not found");
  }

  return match.dataUrl;
}

export async function deleteShelbyFile(id: string): Promise<void> {
  // TODO: Replace this with Shelby S3 Gateway object deletion.
  const files = readFiles().filter((file) => file.id !== id);
  writeFiles(files);
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** unitIndex;

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
