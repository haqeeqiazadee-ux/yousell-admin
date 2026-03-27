"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  indicatorClassName?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    const clampedValue = Math.max(0, Math.min(100, value))

    return (
      <div
        ref={ref}
        data-slot="progress"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn("h-2 w-full overflow-hidden rounded-full bg-brand-800", className)}
        {...props}
      >
        <div
          data-slot="progress-indicator"
          className={cn(
            "h-full rounded-full bg-brand-400 transition-all duration-300 ease-in-out",
            indicatorClassName
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
