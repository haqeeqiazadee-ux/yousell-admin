/**
 * EnginePageLayout — Standard wrapper for engine detail pages
 *
 * Phase D.8: Consistent header with status, health dot, and content area.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import type { EnginePageLayoutProps } from './types';

export function EnginePageLayout({
  title,
  engineId,
  description,
  status,
  healthy,
  children,
  headerActions,
}: EnginePageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <div className="flex items-center gap-2">
              <div
                className={`h-2.5 w-2.5 rounded-full ${healthy ? 'bg-green-500' : 'bg-red-500'}`}
                title={healthy ? 'Healthy' : 'Unhealthy'}
              />
              <Badge variant={status === 'running' ? 'default' : 'outline'}>
                {status}
              </Badge>
            </div>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
