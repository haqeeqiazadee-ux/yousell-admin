"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/notifications");
    const data = await res.json();
    const items: Notification[] = data.notifications || [];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.read).length);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    const res = await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold font-outfit tracking-tight">
              Notifications
            </h1>
            <p className="text-muted-foreground">
              Stay up to date with your admin alerts
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white border-transparent">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications yet</p>
              <p className="text-sm">
                Notifications will appear here when there are updates.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !notification.read ? "border-l-4 border-l-blue-500" : ""
              }`}
              onClick={() => {
                if (!notification.read) markAsRead(notification.id);
              }}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {typeIcons[notification.type] || typeIcons.info}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatTimestamp(notification.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
