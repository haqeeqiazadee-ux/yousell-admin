"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon } from "lucide-react"

// ─── Context ────────────────────────────────────────────────────────────────

interface SelectContextValue {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  disabled?: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select sub-components must be used within <Select>")
  return ctx
}

// ─── Select (root) ──────────────────────────────────────────────────────────

export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children?: React.ReactNode
}

function Select({ value, onValueChange, defaultValue, disabled, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "")

  const controlled = value !== undefined
  const currentValue = controlled ? value : internalValue

  const handleValueChange = React.useCallback(
    (v: string) => {
      if (!controlled) setInternalValue(v)
      onValueChange?.(v)
      setOpen(false)
    },
    [controlled, onValueChange]
  )

  // Close on outside click
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <SelectContext.Provider
      value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen, disabled }}
    >
      <div ref={ref} data-slot="select" className="relative inline-block">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

// ─── SelectTrigger ──────────────────────────────────────────────────────────

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen, disabled } = useSelect()
  return (
    <button
      type="button"
      data-slot="select-trigger"
      aria-expanded={open}
      disabled={disabled}
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        "dark:bg-input/30",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
      />
    </button>
  )
}

// ─── SelectValue ────────────────────────────────────────────────────────────

function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const { value } = useSelect()
  return (
    <span data-slot="select-value" className={cn("truncate", !value && "text-muted-foreground", className)}>
      {value || placeholder}
    </span>
  )
}

// ─── SelectContent ──────────────────────────────────────────────────────────

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open } = useSelect()
  if (!open) return null
  return (
    <div
      data-slot="select-content"
      className={cn(
        "absolute top-full left-0 z-50 mt-1 min-w-full overflow-hidden rounded-lg border border-input bg-popover text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...props}
    >
      <div className="max-h-60 overflow-y-auto p-1">{children}</div>
    </div>
  )
}

// ─── SelectItem ─────────────────────────────────────────────────────────────

function SelectItem({
  value: itemValue,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const { value, onValueChange } = useSelect()
  const selected = value === itemValue
  return (
    <div
      data-slot="select-item"
      role="option"
      aria-selected={selected}
      onClick={() => onValueChange?.(itemValue)}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none",
        "hover:bg-accent hover:text-accent-foreground",
        selected && "bg-accent text-accent-foreground font-medium",
        className
      )}
      {...props}
    >
      {selected && <CheckIcon className="mr-1.5 size-3.5 shrink-0" />}
      {children}
    </div>
  )
}

// ─── SelectGroup / SelectLabel (compatibility stubs) ────────────────────────

function SelectGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="select-group" {...props}>{children}</div>
}

function SelectLabel({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
