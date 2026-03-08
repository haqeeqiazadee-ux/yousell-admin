import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a CSV or Excel file." },
        { status: 400 }
      );
    }

    const text = await file.text();

    if (isCSV) {
      const lines = text.split("\n").filter((line) => line.trim());
      if (lines.length === 0) {
        return NextResponse.json({ error: "File is empty" }, { status: 400 });
      }

      const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
      const previewRows: Record<string, string>[] = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
        const row: Record<string, string> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || "";
        });
        previewRows.push(row);
      }

      return NextResponse.json({
        fileName: file.name,
        fileType: "csv",
        columns: headers,
        totalRows: lines.length - 1,
        preview: previewRows,
      });
    }

    // For Excel files, return column info from raw text parsing
    // Full Excel parsing would require a library like xlsx
    return NextResponse.json({
      fileName: file.name,
      fileType: "excel",
      columns: [],
      totalRows: 0,
      preview: [],
      message: "Excel parsing requires the xlsx library. Install it with: npm install xlsx",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
