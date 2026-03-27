"use client";

import { useEffect, useRef, useCallback, type RefObject } from "react";

/**
 * Section 17 — Gesture hooks using native touch events.
 * No external dependencies — works with raw TouchEvent listeners.
 */

/* ─────────────────────────── useSwipe ─────────────────────────── */

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe(
  ref: RefObject<HTMLElement | null>,
  { onSwipeLeft, onSwipeRight, threshold = 50 }: SwipeOptions
): void {
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX.current;
      const diffY = endY - startY.current;

      // Only fire if horizontal distance exceeds threshold and is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}

/* ──────────────────── usePullToRefresh ──────────────────── */

interface PullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  threshold?: number;
  resistance?: number;
}

export function usePullToRefresh(
  ref: RefObject<HTMLElement | null>,
  { onRefresh, threshold = 70, resistance = 0.4 }: PullToRefreshOptions
): void {
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when scrolled to top
      if (el.scrollTop <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const currentY = e.touches[0].clientY;
      const diff = (currentY - startY.current) * resistance;

      if (diff > 0) {
        el.style.transform = `translateY(${Math.min(diff, threshold * 1.5)}px)`;
        el.style.transition = "none";
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;

      const endY = e.changedTouches[0].clientY;
      const diff = (endY - startY.current) * resistance;

      el.style.transition = "transform 0.3s ease";
      el.style.transform = "";

      if (diff >= threshold) {
        onRefresh();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [ref, onRefresh, threshold, resistance]);
}

/* ──────────────────── useLongPress ──────────────────── */

interface LongPressOptions {
  onLongPress: () => void;
  duration?: number;
}

export function useLongPress(
  ref: RefObject<HTMLElement | null>,
  { onLongPress, duration = 500 }: LongPressOptions
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    longPressTriggered.current = false;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleTouchStart = () => {
      longPressTriggered.current = false;
      timerRef.current = setTimeout(() => {
        longPressTriggered.current = true;
        onLongPress();
      }, duration);
    };

    const handleTouchEnd = () => {
      clear();
    };

    const handleTouchMove = () => {
      // Cancel long press if user moves finger
      clear();
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      clear();
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [ref, onLongPress, duration, clear]);
}
