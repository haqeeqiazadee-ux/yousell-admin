import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const token = request.headers.get("authorization")?.replace("Bearer ", "") || "";

  const body = await request.json();
  if (!body.query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  try {
    const res = await fetch(`${BACKEND_URL}/api/amazon/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: body.query,
        limit: body.limit || 50,
        userId: user.id,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
