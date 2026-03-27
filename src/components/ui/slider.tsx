"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value = 0,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type="range"
        data-slot="slider"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-brand-800 outline-none transition-colors",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-400 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-300 [&::-webkit-slider-thumb]:transition-colors [&::-webkit-slider-thumb]:hover:bg-brand-300",
          "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-400 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-300 [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:hover:bg-brand-300",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
        {...props}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
