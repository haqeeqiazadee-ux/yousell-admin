import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticateAdmin } from "@/lib/auth/admin-api-auth";

export async function GET(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("automation_jobs")
      .select("*")
      .order("job_name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try { await authenticateAdmin(request); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = createAdminClient();

    const body = await request.json();

    // Master kill switch — disable ALL jobs at once
    if (body.killSwitch === true) {
      const { error } = await supabase
        .from("automation_jobs")
        .update({ status: "disabled" })
        .neq("status", "disabled");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const { data: allJobs } = await supabase
        .from("automation_jobs")
        .select("*")
        .order("job_name", { ascending: true });

      return NextResponse.json(allJobs || []);
    }

    // Single job toggle
    const { job_name, status } = body;

    if (!job_name || !status) {
      return NextResponse.json({ error: "job_name and status are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("automation_jobs")
      .update({ status })
      .eq("job_name", job_name)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
