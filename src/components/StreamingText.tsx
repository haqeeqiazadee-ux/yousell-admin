"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreamingTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
  showCopy?: boolean
}

export function StreamingText({
  text,
  speed = 30,
  onComplete,
  className,
  showCopy = true,
}: StreamingTextProps) {
  const [displayedLength, setDisplayedLength] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  const onCompleteRef = useRef(onComplete)

  // Keep the callback ref fresh without triggering re-streams
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Reset and re-stream when text changes
  useEffect(() => {
    setDisplayedLength(0)
    setIsComplete(false)
    setCopied(false)

    if (!text) {
      setIsComplete(true)
      return
    }

    let index = 0
    const interval = setInterval(() => {
      index++
      setDisplayedLength(index)
      if (index >= text.length) {
        clearInterval(interval)
        setIsComplete(true)
        onCompleteRef.current?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: silent fail
    }
  }

  const displayedText = text.slice(0, displayedLength)

  return (
    <div
      aria-live="polite"
      className={cn("relative", className)}
    >
      <span
        className="text-sm"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {displayedText}
        {!isComplete && (
          <span className="streaming-cursor" />
        )}
      </span>

      {isComplete && showCopy && text.length > 0 && (
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "ml-2 inline-flex items-center gap-1 rounded-md px-2 py-0.5",
            "text-xs text-muted-foreground hover:text-foreground",
            "border border-transparent hover:border-border",
            "transition-all duration-300",
            "animate-in fade-in duration-300"
          )}
          aria-label={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? (
            <>
              <Check className="size-3" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
