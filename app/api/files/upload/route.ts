import { NextResponse } from "next/server";
import { uploadLocalShelbyObject } from "@/lib/shelby-local";
import { isShelbyS3Configured, uploadShelbyObject } from "@/lib/shelby-s3";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!isShelbyS3Configured()) {
    const localFile = await uploadLocalShelbyObject(file);
    return NextResponse.json({ mode: "local", file: localFile });
  }

  try {
    const shelbyFile = await uploadShelbyObject(file);
    return NextResponse.json({ file: shelbyFile });
  } catch {
    return NextResponse.json({ error: "Shelby upload failed" }, { status: 502 });
  }
}
