/**
 * EngineControlPanel — Full control panel for engine detail pages
 *
 * Phase D.7: Start/stop, trigger actions, view queue/event info.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, Zap } from 'lucide-react';
import type { EngineControlPanelProps } from './types';

export function EngineControlPanel({
  name,
  engineId,
  status,
  healthy,
  queues,
  publishes,
  subscribes,
  onStart,
  onStop,
  onTrigger,
  disabled = false,
}: EngineControlPanelProps) {
  const isRunning = status === 'running';
  const canStart = status === 'idle' || status === 'stopped';
  const canStop = status === 'running';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Engine Controls</CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Badge variant={isRunning ? 'default' : 'outline'} className="text-xs">
              {status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          {onStart && (
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || !canStart}
              onClick={onStart}
            >
              <Play className="mr-1 h-3 w-3" /> Start
            </Button>
          )}
          {onStop && (
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || !canStop}
              onClick={onStop}
            >
              <Square className="mr-1 h-3 w-3" /> Stop
            </Button>
          )}
          {onTrigger && (
            <Button
              size="sm"
              variant="default"
              disabled={disabled}
              onClick={() => onTrigger('run')}
            >
              <Zap className="mr-1 h-3 w-3" /> Run Now
            </Button>
          )}
        </div>

        {/* Queue Info */}
        {queues.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Queues ({queues.length})</p>
            <div className="flex flex-wrap gap-1">
              {queues.map(q => (
                <Badge key={q} variant="secondary" className="text-xs">{q}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Event Info */}
        <div className="grid grid-cols-2 gap-3">
          {publishes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Publishes</p>
              <div className="space-y-0.5">
                {publishes.map(e => (
                  <p key={e} className="text-xs text-muted-foreground truncate" title={e}>
                    {e.split('.').pop()}
                  </p>
                ))}
              </div>
            </div>
          )}
          {subscribes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Subscribes</p>
              <div className="space-y-0.5">
                {subscribes.map(e => (
                  <p key={e} className="text-xs text-muted-foreground truncate" title={e}>
                    {e.split('.').pop()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
