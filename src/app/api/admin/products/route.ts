import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

// GET /api/admin/products — list products with filtering
export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const adminSb = createAdminClient();

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const platform = searchParams.get("platform");
  const search = searchParams.get("search");
  // BUG-045 fix: Whitelist allowed sort fields to prevent injection
  const allowedSortFields = ["created_at", "title", "platform", "status", "price", "final_score", "viral_score", "trend_stage", "category"];
  const rawSort = searchParams.get("sort") || "created_at";
  const sortBy = allowedSortFields.includes(rawSort) ? rawSort : "created_at";
  const order = searchParams.get("order") || "desc";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = adminSb
    .from("products")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (platform) query = query.eq("platform", platform);
  if (search) query = query.ilike("title", `%${search}%`);

  query = query
    .order(sortBy, { ascending: order === "asc" })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data || [], total: count || 0 });
}

// POST /api/admin/products — create a product
export async function POST(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const adminSb = createAdminClient();
  const body = await request.json();

  const allowedFields = [
    'title', 'platform', 'status', 'price', 'cost', 'currency', 'external_url', 'image_url',
    'category', 'description', 'trend_stage', 'viral_score', 'final_score',
    'channel', 'source_url', 'supplier_url', 'tags',
  ] as const;
  const sanitized: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body && body[key] !== undefined) {
      sanitized[key] = body[key];
    }
  }

  const { data, error } = await adminSb
    .from("products")
    .insert({
      ...sanitized,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}

// PATCH /api/admin/products — update a product
export async function PATCH(request: NextRequest) {
  let user;
  try { user = await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const adminSb = createAdminClient();
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const allowedFields = [
    'title', 'platform', 'status', 'price', 'cost', 'currency', 'external_url', 'image_url',
    'category', 'description', 'trend_stage', 'viral_score', 'final_score',
    'channel', 'source_url', 'supplier_url', 'tags',
  ] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body && body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  const { data, error } = await adminSb
    .from("products")
    .update({ ...updates, updated_by: user.id })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}

// DELETE /api/admin/products — delete a product
export async function DELETE(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const adminSb = createAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Product id is required" }, { status: 400 });
  }

  const { error } = await adminSb
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
