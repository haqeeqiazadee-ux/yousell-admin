"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn(
        "relative overflow-auto",
        "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-brand-600",
        "[&::-webkit-scrollbar-thumb:hover]:bg-brand-500",
        "scrollbar-thin scrollbar-thumb-brand-600 scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
