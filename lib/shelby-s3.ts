import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import type { ShelbyFile } from "@/lib/shelby";

type ShelbyS3Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export type ShelbyObjectResponse = {
  body: Uint8Array;
  contentType: string;
  fileName: string;
};

const SHELBY_STORAGE_MODE = "Shelby hot storage";

// TODO: Confirm final Shelby S3 Gateway settings and credential flow before production use.

function getEnvConfig(): ShelbyS3Config | null {
  const endpoint = process.env.SHELBY_S3_ENDPOINT;
  const accessKeyId = process.env.SHELBY_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SHELBY_SECRET_ACCESS_KEY;
  const bucket = process.env.SHELBY_BUCKET;

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket,
  };
}

function getConfig() {
  const config = getEnvConfig();
  if (!config) {
    throw new Error("Shelby S3 environment is not configured");
  }

  return config;
}

function getS3Client() {
  const config = getConfig();

  return new S3Client({
    endpoint: config.endpoint,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
}

function createObjectKey(fileName: string) {
  return `${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}`;
}

function fileNameFromKey(key: string) {
  return key.replace(/^\d+-[0-9a-f-]{36}-/i, "") || key;
}

function toShelbyFile(args: {
  key: string;
  name: string;
  size: number;
  type: string;
  uploadedAt?: Date;
}): ShelbyFile {
  return {
    id: args.key,
    name: args.name,
    size: args.size,
    type: args.type,
    uploadedAt: (args.uploadedAt ?? new Date()).toISOString(),
    storageMode: SHELBY_STORAGE_MODE,
    readCount: 0,
    dataUrl: `/api/files/${encodeURIComponent(args.key)}`,
  };
}

export function isShelbyS3Configured() {
  return getEnvConfig() !== null;
}

export async function uploadShelbyObject(file: File): Promise<ShelbyFile> {
  const config = getConfig();
  const client = getS3Client();
  const key = createObjectKey(file.name);
  const body = Buffer.from(await file.arrayBuffer());
  const type = file.type || "application/octet-stream";

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: type,
      Metadata: {
        "original-name": file.name,
      },
    }),
  );

  return toShelbyFile({
    key,
    name: file.name,
    size: file.size,
    type,
  });
}

export async function listShelbyObjects(): Promise<ShelbyFile[]> {
  const config = getConfig();
  const client = getS3Client();
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: config.bucket,
      MaxKeys: 100,
    }),
  );

  const objects = result.Contents ?? [];
  const files = await Promise.all(
    objects
      .filter((object) => Boolean(object.Key))
      .map(async (object) => {
        const key = object.Key ?? "";
        try {
          const head = await client.send(
            new HeadObjectCommand({
              Bucket: config.bucket,
              Key: key,
            }),
          );

          return toShelbyFile({
            key,
            name: head.Metadata?.["original-name"] ?? fileNameFromKey(key),
            size: object.Size ?? 0,
            type: head.ContentType ?? "application/octet-stream",
            uploadedAt: object.LastModified,
          });
        } catch {
          return toShelbyFile({
            key,
            name: fileNameFromKey(key),
            size: object.Size ?? 0,
            type: "application/octet-stream",
            uploadedAt: object.LastModified,
          });
        }
      }),
  );

  return files.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function getShelbyObject(key: string): Promise<ShelbyObjectResponse> {
  const config = getConfig();
  const client = getS3Client();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );

  if (!result.Body) {
    throw new Error("Shelby object body is empty");
  }

  const body = await result.Body.transformToByteArray();

  return {
    body,
    contentType: result.ContentType ?? "application/octet-stream",
    fileName: result.Metadata?.["original-name"] ?? fileNameFromKey(key),
  };
}

export async function deleteShelbyObject(key: string): Promise<void> {
  const config = getConfig();
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
  );
}
