import { NextResponse } from "next/server";
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

export async function GET(_request: Request, context: FileRouteContext) {
  if (!isShelbyS3Configured()) {
    return NextResponse.json({ mode: "local" }, { status: 503 });
  }

  const { key } = await context.params;

  try {
    const object = await getShelbyObject(key);
    const body = new ArrayBuffer(object.body.byteLength);
    new Uint8Array(body).set(object.body);

    return new Response(body, {
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
  if (!isShelbyS3Configured()) {
    return NextResponse.json({ mode: "local" }, { status: 503 });
  }

  const { key } = await context.params;

  try {
    await deleteShelbyObject(key);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Shelby delete failed" }, { status: 502 });
  }
}
