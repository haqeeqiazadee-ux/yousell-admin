"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Users, Plus, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  plan: "starter" | "growth" | "professional" | "enterprise";
  default_product_limit?: number;
  niche: string;
  notes?: string;
  created_at: string;
}

const planColors: Record<string, string> = {
  starter: "text-gray-500 border-gray-500/30",
  growth: "text-blue-500 border-blue-500/30",
  professional: "text-purple-500 border-purple-500/30",
  enterprise: "text-yellow-600 border-yellow-500/30",
};

const PLAN_LIMITS: Record<string, number> = {
  starter: 3,
  growth: 10,
  professional: 25,
  enterprise: 50,
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<string>("starter");
  const [newNiche, setNewNiche] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clients");
    const data = await res.json();
    setClients(data.clients || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        plan: newPlan,
        niche: newNiche || undefined,
        notes: newNotes || undefined,
      }),
    });

    if (res.ok) {
      setNewName("");
      setNewEmail("");
      setNewPlan("starter");
      setNewNiche("");
      setNewNotes("");
      setDialogOpen(false);
      fetchClients();
    }
    setSubmitting(false);
  };

  const handleUpdatePlan = async (clientId: string, plan: string) => {
    const res = await fetch("/api/admin/clients", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: clientId, plan }),
    });
    if (res.ok) {
      setEditingPlan(null);
      fetchClients();
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Delete client "${clientName}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/clients?id=${clientId}`, {
      method: "DELETE",
    });
    if (res.ok) fetchClients();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Clients
          </h1>
          <p className="text-muted-foreground">
            {total} client{total !== 1 ? "s" : ""} managed
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <select
                  id="plan"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="niche">Niche</Label>
                <Input
                  id="niche"
                  value={newNiche}
                  onChange={(e) => setNewNiche(e.target.value)}
                  placeholder="e.g. Beauty & Skincare"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Optional notes..."
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Adding..." : "Add Client"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3" />
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No clients yet</p>
              <p className="text-sm">
                Add your first client to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Niche</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.email}
                    </TableCell>
                    <TableCell>
                      {editingPlan === client.id ? (
                        <select
                          defaultValue={client.plan}
                          onChange={(e) => handleUpdatePlan(client.id, e.target.value)}
                          onBlur={() => setEditingPlan(null)}
                          autoFocus
                          className="rounded-md border px-2 py-1 text-xs"
                        >
                          <option value="starter">Starter</option>
                          <option value="growth">Growth</option>
                          <option value="professional">Professional</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      ) : (
                        <Badge
                          variant="outline"
                          className={`${planColors[client.plan]} cursor-pointer`}
                          onClick={() => setEditingPlan(client.id)}
                        >
                          {client.plan}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.default_product_limit || PLAN_LIMITS[client.plan] || 3} products
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.niche || "\u2014"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
