export type FileTextStatus = "text-ready" | "metadata-only" | "ocr-pending";

export type ShelbyFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  storageMode: "Shelby hot storage";
  readCount: number;
  dataUrl: string;
  extractedText?: string;
  textStatus?: FileTextStatus;
};

const SHELBY_STORAGE_KEY = "shelby-knowledge-vault-files";

type ShelbyFilesResponse = {
  files?: ShelbyFile[];
};

type ShelbyUploadResponse = {
  file?: ShelbyFile;
};

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

function isLocalModeStatus(status: number) {
  return status === 404 || status === 503;
}

function findLocalFile(id: string) {
  return readFiles().find((file) => file.id === id);
}

async function uploadToLocalShelby(file: File): Promise<ShelbyFile> {
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

async function listLocalShelbyFiles(): Promise<ShelbyFile[]> {
  return readFiles();
}

async function getLocalShelbyFileUrl(id: string): Promise<string> {
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

async function deleteLocalShelbyFile(id: string): Promise<void> {
  const files = readFiles().filter((file) => file.id !== id);
  writeFiles(files);
}

export async function uploadToShelby(file: File): Promise<ShelbyFile> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const payload = (await response.json()) as ShelbyUploadResponse;
      if (payload.file) {
        return payload.file;
      }
    }

    if (!isLocalModeStatus(response.status)) {
      console.warn("Shelby S3 upload failed; using local preview mode.");
    }
  } catch {
    console.warn("Shelby S3 upload unavailable; using local preview mode.");
  }

  return uploadToLocalShelby(file);
}

export async function listShelbyFiles(): Promise<ShelbyFile[]> {
  try {
    const response = await fetch("/api/files", {
      method: "GET",
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as ShelbyFilesResponse;
      return payload.files ?? [];
    }

    if (!isLocalModeStatus(response.status)) {
      console.warn("Shelby S3 list failed; using local preview mode.");
    }
  } catch {
    console.warn("Shelby S3 list unavailable; using local preview mode.");
  }

  return listLocalShelbyFiles();
}

export async function getShelbyFileUrl(id: string): Promise<string> {
  if (findLocalFile(id)) {
    return getLocalShelbyFileUrl(id);
  }

  return `/api/files/${encodeURIComponent(id)}`;
}

export async function deleteShelbyFile(id: string): Promise<void> {
  if (findLocalFile(id)) {
    await deleteLocalShelbyFile(id);
    return;
  }

  try {
    const response = await fetch(`/api/files/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (response.ok || isLocalModeStatus(response.status)) {
      return;
    }
  } catch {
    console.warn("Shelby S3 delete unavailable.");
    return;
  }

  throw new Error("Shelby file delete failed");
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
