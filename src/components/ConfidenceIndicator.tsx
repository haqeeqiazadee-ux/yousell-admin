import { cn } from "@/lib/utils"

interface ConfidenceIndicatorProps {
  confidence: number
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: "h-1.5 w-1.5", // 6px
  md: "h-2 w-2",     // 8px
  lg: "h-2.5 w-2.5", // 10px
} as const

export function ConfidenceIndicator({
  confidence,
  size = "md",
  className,
}: ConfidenceIndicatorProps) {
  // Below 60%: invisible
  if (confidence < 60) {
    return null
  }

  const isHigh = confidence >= 85

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        sizeMap[size],
        className
      )}
      style={{
        backgroundColor: isHigh
          ? "var(--color-success)"
          : "var(--color-warning)",
      }}
      role="img"
      aria-label={
        isHigh
          ? "High confidence"
          : "Medium confidence"
      }
    />
  )
}
