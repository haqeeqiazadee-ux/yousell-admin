import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";
import { discoverTikTokVideos } from "@/lib/engines/tiktok-discovery";

export async function POST(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { query, limit } = body;

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const result = await discoverTikTokVideos(query, limit || 30);

    return NextResponse.json({
      status: "completed",
      videosFound: result.videosFound,
      videosStored: result.videosStored,
      hashtagsAnalyzed: result.hashtagsAnalyzed,
      ...(result.errors.length > 0 ? { warnings: result.errors } : {}),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Discovery failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
