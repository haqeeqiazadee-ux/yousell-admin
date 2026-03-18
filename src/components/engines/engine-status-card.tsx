/**
 * EngineStatusCard — Compact engine health card for dashboard grid
 *
 * Phase D.5: Shows engine name, status, health dot, and queue count.
 * Clickable to navigate to engine detail page.
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EngineStatusCardProps } from './types';

const STATUS_COLORS: Record<string, string> = {
  idle: 'bg-gray-400',
  running: 'bg-green-500',
  paused: 'bg-yellow-500',
  error: 'bg-red-500',
  stopped: 'bg-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
  error: 'Error',
  stopped: 'Stopped',
};

export function EngineStatusCard({
  name,
  engineId,
  status,
  healthy,
  queueCount,
  lastRun,
  description,
  onClick,
}: EngineStatusCardProps) {
  const statusColor = STATUS_COLORS[status] || 'bg-gray-400';

  return (
    <Card
      className={`transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{name}</h3>
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}
              title={healthy ? 'Healthy' : 'Unhealthy'}
            />
            <Badge variant="outline" className="text-xs">
              {STATUS_LABELS[status] || status}
            </Badge>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>{queueCount} queue{queueCount !== 1 ? 's' : ''}</span>
          {lastRun && (
            <span title={lastRun}>
              Last: {formatTimeAgo(lastRun)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
