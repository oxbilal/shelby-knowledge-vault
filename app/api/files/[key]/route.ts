import { NextResponse } from "next/server";
import { deleteLocalShelbyObject, getLocalShelbyObject } from "@/lib/shelby-local";
import { deleteShelbyObject, getShelbyObject, isShelbyS3Configured } from "@/lib/shelby-s3";

export const runtime = "nodejs";

type FileRouteContext = {
  params: Promise<{
    key: string;
  }>;
};

function contentDisposition(fileName: string) {
  const safeName = fileName.replace(/"/g, "'");
  return `inline; filename="${safeName}"`;
}

function bytesToArrayBuffer(bytes: Uint8Array) {
  const body = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(body).set(bytes);
  return body;
}

export async function GET(_request: Request, context: FileRouteContext) {
  const { key } = await context.params;

  if (!isShelbyS3Configured()) {
    const object = getLocalShelbyObject(key);
    if (!object) {
      return NextResponse.json({ error: "Local file not found" }, { status: 404 });
    }

    return new Response(bytesToArrayBuffer(object.body), {
      headers: {
        "Content-Type": object.contentType,
        "Content-Disposition": contentDisposition(object.fileName),
        "Cache-Control": "private, max-age=60",
      },
    });
  }

  try {
    const object = await getShelbyObject(key);

    return new Response(bytesToArrayBuffer(object.body), {
      headers: {
        "Content-Type": object.contentType,
        "Content-Disposition": contentDisposition(object.fileName),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Shelby file not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: FileRouteContext) {
  const { key } = await context.params;

  if (!isShelbyS3Configured()) {
    deleteLocalShelbyObject(key);
    return NextResponse.json({ mode: "local", ok: true });
  }

  try {
    await deleteShelbyObject(key);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Shelby delete failed" }, { status: 502 });
  }
}
