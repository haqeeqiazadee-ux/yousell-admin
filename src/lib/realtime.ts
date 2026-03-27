import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Section 16.3 — Supabase Realtime subscriptions
 * Browser-side real-time listeners for engine status, alerts, and scan progress.
 */

type UnsubscribeFn = () => void;

/**
 * Subscribe to engine_status table changes.
 * Fires callback on INSERT, UPDATE, and DELETE events.
 */
export function subscribeToEngineStatus(
  callback: (payload: {
    eventType: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void
): UnsubscribeFn {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel("engine-status-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "engine_status" },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: (payload.new as Record<string, unknown>) ?? {},
          old: (payload.old as Record<string, unknown>) ?? {},
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to alerts for a specific user.
 * Listens for new alerts inserted into the alerts table matching the user ID.
 */
export function subscribeToAlerts(
  userId: string,
  callback: (payload: {
    eventType: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void
): UnsubscribeFn {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel(`alerts-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "alerts",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: (payload.new as Record<string, unknown>) ?? {},
          old: (payload.old as Record<string, unknown>) ?? {},
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to scan progress updates.
 * Listens for changes on the scan_progress table (or broadcast channel).
 */
export function subscribeToScanProgress(
  callback: (payload: {
    eventType: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  }) => void
): UnsubscribeFn {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel("scan-progress")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "scan_progress" },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: (payload.new as Record<string, unknown>) ?? {},
          old: (payload.old as Record<string, unknown>) ?? {},
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
