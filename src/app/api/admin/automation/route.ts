import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
