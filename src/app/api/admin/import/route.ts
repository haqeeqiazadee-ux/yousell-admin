import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/roles";

// RFC 4180-compatible CSV row parser that handles quoted fields with commas
function parseCSVRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

export async function POST(request: Request) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const platform = formData.get("platform") as string || "manual";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a CSV file." },
        { status: 400 }
      );
    }

    if (isExcel) {
      return NextResponse.json({
        result: {
          filename: file.name,
          rows_imported: 0,
          errors: 1,
          status: "failed",
        },
        message: "Excel files are not supported. Please convert to CSV and re-upload.",
      }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length <= 1) {
      return NextResponse.json({
        result: {
          filename: file.name,
          rows_imported: 0,
          errors: 0,
          status: "failed",
        },
        message: "File is empty or has only headers",
      });
    }

    const headers = parseCSVRow(lines[0]).map((h) => h.replace(/^"|"$/g, "").toLowerCase());

    // Map CSV columns to product fields
    const titleCol = headers.findIndex((h) => ["title", "name", "product", "product_name", "product_title"].includes(h));
    const priceCol = headers.findIndex((h) => ["price", "cost", "retail_price", "product_price"].includes(h));
    const urlCol = headers.findIndex((h) => ["url", "link", "product_url", "external_url"].includes(h));
    const imageCol = headers.findIndex((h) => ["image", "image_url", "photo", "thumbnail"].includes(h));
    const categoryCol = headers.findIndex((h) => ["category", "type", "product_type"].includes(h));

    if (titleCol === -1) {
      return NextResponse.json({
        result: {
          filename: file.name,
          rows_imported: 0,
          errors: 1,
          status: "failed",
        },
        message: "CSV must have a 'title' or 'name' column",
      });
    }

    let imported = 0;
    let errors = 0;
    const products: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVRow(lines[i]);
      const title = values[titleCol];
      if (!title) { errors++; continue; }

      products.push({
        title,
        platform,
        price: priceCol >= 0 ? parseFloat(values[priceCol]) || null : null,
        external_url: urlCol >= 0 ? values[urlCol] || null : null,
        image_url: imageCol >= 0 ? values[imageCol] || null : null,
        category: categoryCol >= 0 ? values[categoryCol] || null : null,
        status: "draft",
        created_by: user.id,
        updated_by: user.id,
      });
    }

    if (products.length > 0) {
      const { error: insertError } = await supabase
        .from("products")
        .insert(products);

      if (insertError) {
        errors += products.length;
        imported = 0;
      } else {
        imported = products.length;
      }
    }

    // Log the import
    await supabase.from("imported_files").insert({
      filename: file.name,
      type: "csv",
      source_platform: platform,
      rows_imported: imported,
      errors: [{ count: errors }],
      uploaded_by: user.id,
    });

    const status = errors === 0 ? "success" : imported > 0 ? "partial" : "failed";

    return NextResponse.json({
      result: {
        filename: file.name,
        rows_imported: imported,
        errors,
        status,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
