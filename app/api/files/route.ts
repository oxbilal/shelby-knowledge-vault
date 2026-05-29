import { NextResponse } from "next/server";
import { listLocalShelbyObjects } from "@/lib/shelby-local";
import { isShelbyS3Configured, listShelbyObjects } from "@/lib/shelby-s3";

export const runtime = "nodejs";

export async function GET() {
  if (!isShelbyS3Configured()) {
    return NextResponse.json({ mode: "local", files: listLocalShelbyObjects() });
  }

  try {
    const files = await listShelbyObjects();
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ error: "Shelby list failed" }, { status: 502 });
  }
}
