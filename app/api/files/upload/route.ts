import { NextResponse } from "next/server";
import { isShelbyS3Configured, uploadShelbyObject } from "@/lib/shelby-s3";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isShelbyS3Configured()) {
    return NextResponse.json({ mode: "local" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const shelbyFile = await uploadShelbyObject(file);
    return NextResponse.json({ file: shelbyFile });
  } catch {
    return NextResponse.json({ error: "Shelby upload failed" }, { status: 502 });
  }
}
