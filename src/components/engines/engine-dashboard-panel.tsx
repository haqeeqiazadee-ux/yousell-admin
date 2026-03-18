/**
 * EngineDashboardPanel — Metrics panel with stats and quick actions
 *
 * Phase D.6: Larger panel for dashboard showing KPIs, activity, and actions.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EngineDashboardPanelProps, EngineStat, EngineActivity } from './types';

const STATUS_VARIANT: Record<string, 'default' | 'outline' | 'secondary' | 'destructive'> = {
  idle: 'outline',
  running: 'default',
  paused: 'secondary',
  error: 'destructive',
  stopped: 'outline',
};

export function EngineDashboardPanel({
  name,
  engineId,
  status,
  metrics,
  stats,
  recentActivity,
  actions,
}: EngineDashboardPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          <Badge variant={STATUS_VARIANT[status] || 'outline'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <StatItem key={i} stat={stat} />
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity && recentActivity.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
            {recentActivity.slice(0, 3).map(item => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2">
            {actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="text-xs"
              >
                {action.loading ? 'Running...' : action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatItem({ stat }: { stat: EngineStat }) {
  const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;
  const trendColor = stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-400';

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{stat.label}</p>
      <div className="flex items-center gap-1">
        <span className="text-lg font-semibold">{stat.value}</span>
        {stat.change !== undefined && (
          <span className={`flex items-center text-xs ${trendColor}`}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(stat.change)}%
          </span>
        )}
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: EngineActivity }) {
  const typeColors: Record<string, string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  return (
    <div className="flex items-center justify-between text-xs">
      <span className={typeColors[item.type] || 'text-muted-foreground'}>
        {item.message}
      </span>
      <span className="text-muted-foreground whitespace-nowrap ml-2">
        {formatShortTime(item.timestamp)}
      </span>
    </div>
  );
}

function formatShortTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
