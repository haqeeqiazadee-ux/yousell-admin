"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children?: React.ReactNode
  placeholder?: string
  className?: string
  disabled?: boolean
}

function Select({
  value,
  onValueChange,
  children,
  placeholder,
  className,
  disabled,
}: SelectProps) {
  return (
    <div data-slot="select" className={cn("relative", className)}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "h-8 w-full appearance-none rounded-lg border border-input bg-transparent px-2.5 py-1 pr-8 text-sm transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
          "dark:bg-input/30 dark:disabled:bg-input/80"
        )}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

function SelectOption({
  value,
  children,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  )
}

export { Select, SelectOption }
