"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/* ---- Context ---- */

type AccordionContextValue = {
  openItems: Set<string>
  toggle: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: new Set(),
  toggle: () => {},
  type: "single",
})

const AccordionItemContext = React.createContext<string>("")

/* ---- Accordion ---- */

export interface AccordionProps extends React.ComponentProps<"div"> {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
}

function Accordion({
  className,
  type = "single",
  defaultValue,
  children,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue])
  })

  const toggle = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev)
        if (next.has(value)) {
          next.delete(value)
        } else {
          if (type === "single") {
            next.clear()
          }
          next.add(value)
        }
        return next
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type }}>
      <div data-slot="accordion" className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

/* ---- AccordionItem ---- */

export interface AccordionItemProps extends React.ComponentProps<"div"> {
  value: string
}

function AccordionItem({
  className,
  value,
  children,
  ...props
}: AccordionItemProps) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = openItems.has(value)

  return (
    <AccordionItemContext.Provider value={value}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn("border-b border-input", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

/* ---- AccordionTrigger ---- */

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { toggle, openItems } = React.useContext(AccordionContext)
  const value = React.useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  return (
    <button
      type="button"
      data-slot="accordion-trigger"
      data-state={isOpen ? "open" : "closed"}
      aria-expanded={isOpen}
      onClick={() => toggle(value)}
      className={cn(
        "flex w-full items-center justify-between py-3 text-sm font-medium transition-colors hover:text-foreground/80 outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:rounded-sm",
        className
      )}
      {...props}
    >
      {children}
      <svg
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
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
    </button>
  )
}

/* ---- AccordionContent ---- */

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { openItems } = React.useContext(AccordionContext)
  const value = React.useContext(AccordionItemContext)
  const isOpen = openItems.has(value)

  return (
    <div
      data-slot="accordion-content"
      data-state={isOpen ? "open" : "closed"}
      role="region"
      className={cn(
        "grid transition-all duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
      {...props}
    >
      <div className="overflow-hidden">
        <div className={cn("pb-3 text-sm", className)}>{children}</div>
      </div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
