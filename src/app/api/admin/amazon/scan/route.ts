import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.query) return NextResponse.json({ error: "query is required" }, { status: 400 });

  const res = await fetch(`${BACKEND_URL}/api/amazon/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      query: body.query,
      limit: body.limit || 50,
      userId: session.user.id,
    }),
  });

  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.error || "Backend error" }, { status: res.status });
  return NextResponse.json(data);
}
