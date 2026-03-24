"use client";

import { useEffect, useState, useCallback } from "react";
import { EnginePageLayout } from "@/components/engines";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Swords, Plus, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface Competitor {
  id: string;
  name: string;
  url: string | null;
  platform: string | null;
  category: string | null;
  notes: string | null;
  metrics: Record<string, unknown>;
  last_analyzed_at: string | null;
  created_at: string;
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCompetitors = useCallback(async () => {
    setLoading(true);
    const res = await authFetch("/api/admin/competitors");
    const data = await res.json();
    setCompetitors(data.competitors || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await authFetch("/api/admin/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        url: newUrl || undefined,
        platform: newPlatform || undefined,
        category: newCategory || undefined,
        notes: newNotes || undefined,
      }),
    });

    if (res.ok) {
      setNewName("");
      setNewUrl("");
      setNewPlatform("");
      setNewCategory("");
      setNewNotes("");
      setDialogOpen(false);
      fetchCompetitors();
    }
    setSubmitting(false);
  };

  return (
    <EnginePageLayout
      title="Competitors"
      engineId="shopify-intelligence"
      description={`${total} competitor${total !== 1 ? "s" : ""} tracked`}
      status="idle"
      healthy={true}
    >
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button><Plus className="h-4 w-4 mr-2" />Add Competitor</Button>}
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Competitor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Competitor Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. CompetitorCo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="compUrl">Website URL</Label>
                <Input
                  id="compUrl"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Input
                    id="platform"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    placeholder="e.g. Amazon, Shopify"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compCat">Category</Label>
                  <Input
                    id="compCat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Electronics"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key observations..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Competitor"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No competitors tracked</p>
              <p className="text-sm">
                Add competitors to monitor their pricing, products, and strategies.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Last Analyzed</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium">{comp.name}</TableCell>
                    <TableCell>
                      {comp.platform ? (
                        <Badge variant="outline" className="text-xs">
                          {comp.platform}
                        </Badge>
                      ) : (
                        "\u2014"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {comp.category || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {comp.notes || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {comp.last_analyzed_at
                        ? new Date(comp.last_analyzed_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {comp.url && (
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {competitors.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <span className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, competitors.length)} of {competitors.length}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(competitors.length / PAGE_SIZE)} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          )}
        </CardContent>
      </Card>
    </div>
    </EnginePageLayout>
  );
}
