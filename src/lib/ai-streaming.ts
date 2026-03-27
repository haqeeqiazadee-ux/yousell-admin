"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Section 16.4 — AI Streaming utility
 * Streams AI-generated content from the engine endpoint using SSE.
 */

export async function streamAIResponse(
  prompt: string,
  onChunk: (text: string) => void,
  onComplete?: () => void
): Promise<void> {
  try {
    const response = await fetch("/api/engine/content/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`AI stream request failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Response body is not readable");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue; // skip comments/keep-alive

        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data === "[DONE]") {
            onComplete?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.text ?? parsed.content ?? parsed.delta?.content ?? data;
            onChunk(typeof text === "string" ? text : String(text));
          } catch {
            // If not valid JSON, treat the raw data as text
            onChunk(data);
          }
        }
      }
    }

    onComplete?.();
  } catch (error) {
    console.error("[ai-streaming] Stream error:", error);
    throw error;
  }
}

/**
 * React hook for progressive AI text streaming.
 * Uses a 30ms display delay between chunks per Section 6.5.
 */
export function useAIStream() {
  const [text, setText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef(false);

  const startStream = useCallback(async (prompt: string) => {
    setText("");
    setError(null);
    setIsStreaming(true);
    abortRef.current = false;

    const chunkQueue: string[] = [];
    let processing = false;

    const processQueue = () => {
      if (processing || abortRef.current) return;
      processing = true;

      const drain = () => {
        if (chunkQueue.length === 0 || abortRef.current) {
          processing = false;
          return;
        }
        const chunk = chunkQueue.shift()!;
        setText((prev) => prev + chunk);
        // 30ms delay between chunks for smooth display (Section 6.5)
        setTimeout(drain, 30);
      };

      drain();
    };

    try {
      await streamAIResponse(
        prompt,
        (chunk) => {
          chunkQueue.push(chunk);
          processQueue();
        },
        () => {
          // Wait for remaining chunks to drain before marking complete
          const waitForDrain = () => {
            if (chunkQueue.length === 0) {
              setIsStreaming(false);
            } else {
              setTimeout(waitForDrain, 50);
            }
          };
          waitForDrain();
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStreaming(false);
    }
  }, []);

  return { text, isStreaming, error, startStream };
}
