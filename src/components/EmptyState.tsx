"use client";

import { type ReactNode } from "react";
import {
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  FileX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateVariant =
  | "no-products"
  | "first-login"
  | "engine-offline"
  | "no-alerts"
  | "no-briefing"
  | "generic";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const variantDefaults: Record<
  EmptyStateVariant,
  {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
  }
> = {
  "no-products": {
    icon: <Search className="size-12 text-muted-foreground" />,
    title: "No products found",
    description: "Try adjusting your filters or search terms",
    actionLabel: "Adjust filters",
  },
  "first-login": {
    icon: <Sparkles className="size-12 text-muted-foreground" />,
    title: "Welcome to YouSell!",
    description:
      "Run your first product scan to start discovering opportunities",
    actionLabel: "Run first scan",
  },
  "engine-offline": {
    icon: <AlertCircle className="size-12 text-red-500" />,
    title: "Engine offline",
    description: "This engine is not responding. Try restarting it.",
    actionLabel: "Restart",
  },
  "no-alerts": {
    icon: <CheckCircle className="size-12 text-green-500" />,
    title: "All clear!",
    description: "You have no active alerts. Products are being monitored.",
  },
  "no-briefing": {
    icon: <Clock className="size-12 text-muted-foreground" />,
    title: "Briefing generates at 09:00 UTC",
    description: "Next briefing in a few hours. Check back soon.",
  },
  generic: {
    icon: <FileX className="size-12 text-muted-foreground" />,
    title: "Nothing here yet",
    description: "No data to display",
  },
};

export function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  const defaults = variantDefaults[variant];

  const resolvedIcon = icon ?? defaults.icon;
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedActionLabel = actionLabel ?? defaults.actionLabel;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4">{resolvedIcon}</div>
      <h3 className="text-lg font-semibold">{resolvedTitle}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        {resolvedDescription}
      </p>
      {resolvedActionLabel && onAction && (
        <Button
          onClick={onAction}
          className="mt-4 bg-brand-400 hover:bg-brand-400/90 text-white"
        >
          {resolvedActionLabel}
        </Button>
      )}
    </div>
  );
}
