"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

type Platform = "tiktok" | "amazon" | "shopify" | "pinterest";

interface ImportResult {
  filename: string;
  rows_imported: number;
  errors: number;
  status: "success" | "partial" | "failed";
}

const platformOptions: { value: Platform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "amazon", label: "Amazon" },
  { value: "shopify", label: "Shopify" },
  { value: "pinterest", label: "Pinterest" },
];

export default function ImportPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("tiktok");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", selectedPlatform);

      const res = await authFetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.result) {
        setResults((prev) => [data.result, ...prev]);
      }
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setResults((prev) => [
        {
          filename: file.name,
          rows_imported: 0,
          errors: 1,
          status: "failed" as const,
        },
        ...prev,
      ]);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Import Data
        </h1>
        <p className="text-muted-foreground">
          Upload CSV or Excel files from external tools
        </p>
      </div>

      <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
        <p className="text-sm text-yellow-700 dark:text-yellow-400">
          CSV Import — Upload product data from external tools
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold font-outfit">Upload File</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <div className="flex gap-2">
              {platformOptions.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={selectedPlatform === opt.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatform(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            {file ? (
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse (CSV, XLSX)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold font-outfit">
              Import Results
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{result.filename}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.rows_imported} rows imported
                        {result.errors > 0 && (
                          <span className="text-red-500">
                            {" "}
                            &middot; {result.errors} error
                            {result.errors !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    {result.status === "success" ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : result.status === "partial" ? (
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Partial
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-600 border-red-500/30">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
