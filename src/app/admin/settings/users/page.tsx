"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserPlus, MoreHorizontal, Mail, Shield, Eye,
  Trash2, RefreshCw, Loader2, CheckCircle, Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst" | "viewer" | "pending";
  avatar_url: string | null;
  last_seen: string | null;
  invited_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  analyst: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  viewer: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

const MOCK_USERS: TeamMember[] = [
  { id: "u1", name: "Usman Khan", email: "usman@yousell.co", role: "admin", avatar_url: null, last_seen: "2026-03-27T09:14:00Z", invited_at: "2025-01-10T10:00:00Z" },
  { id: "u2", name: "Sarah Mitchell", email: "sarah@yousell.co", role: "admin", avatar_url: null, last_seen: "2026-03-27T08:45:00Z", invited_at: "2025-02-15T10:00:00Z" },
  { id: "u3", name: "James Chen", email: "james@yousell.co", role: "analyst", avatar_url: null, last_seen: "2026-03-26T16:30:00Z", invited_at: "2025-06-01T10:00:00Z" },
  { id: "u4", name: "Priya Sharma", email: "priya@yousell.co", role: "analyst", avatar_url: null, last_seen: "2026-03-25T11:20:00Z", invited_at: "2025-08-20T10:00:00Z" },
  { id: "u5", name: "Alex Turner", email: "alex@yousell.co", role: "viewer", avatar_url: null, last_seen: "2026-03-24T14:00:00Z", invited_at: "2025-11-05T10:00:00Z" },
  { id: "u6", name: "Maria Lopez", email: "maria@agency.com", role: "pending", avatar_url: null, last_seen: null, invited_at: "2026-03-26T09:00:00Z" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function relativeTime(iso: string | null) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UserManagementPage() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("viewer");
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/settings/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? MOCK_USERS);
      } else {
        setUsers(MOCK_USERS);
      }
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleInvite() {
    if (!inviteEmail) return;
    setSubmitting(true);
    try {
      await authFetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite", email: inviteEmail, role: inviteRole }),
      });
      const newUser: TeamMember = {
        id: `u${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: "pending",
        avatar_url: null,
        last_seen: null,
        invited_at: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setInviteEmail("");
      setInviteRole("viewer");
      setInviteOpen(false);
    } catch (err) {
      console.error("Failed to invite user:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(userId: string, action: string) {
    try {
      await authFetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId }),
      });
      if (action === "remove") {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else if (action === "resend") {
        // Toast feedback would go here
      }
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  }

  async function handleBulkAction() {
    if (!bulkAction || selectedIds.size === 0) return;
    try {
      await authFetch("/api/admin/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkAction, userIds: Array.from(selectedIds) }),
      });
      if (bulkAction === "remove") {
        setUsers((prev) => prev.filter((u) => !selectedIds.has(u.id)));
      }
      setSelectedIds(new Set());
      setBulkAction("");
    } catch (err) {
      console.error("Bulk action failed:", err);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }

  /* KPI cards */
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.role !== "pending").length;
  const pendingInvites = users.filter((u) => u.role === "pending").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" /> User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage team members and their access levels
          </p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="h-4 w-4 mr-2" /> Invite Team Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleInvite} disabled={submitting || !inviteEmail}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                Send Invite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">{activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{pendingInvites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-500">{adminCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Bulk action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="change_role">Change role</SelectItem>
              <SelectItem value="remove">Remove</SelectItem>
              <SelectItem value="resend">Resend invite</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={handleBulkAction} disabled={!bulkAction}>
            Apply
          </Button>
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleAll}
                      className="rounded border-muted-foreground"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleSelect(user.id)}
                        className="rounded border-muted-foreground"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {getInitials(user.name)}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_STYLES[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        {user.last_seen ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
                        {relativeTime(user.last_seen)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(user.id, "change_role")}>
                            <Shield className="h-4 w-4 mr-2" /> Change role
                          </DropdownMenuItem>
                          {user.role === "pending" && (
                            <DropdownMenuItem onClick={() => handleAction(user.id, "resend")}>
                              <RefreshCw className="h-4 w-4 mr-2" /> Resend invite
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAction(user.id, "view")}>
                            <Eye className="h-4 w-4 mr-2" /> View activity
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAction(user.id, "remove")}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
