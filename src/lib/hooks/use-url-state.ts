"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Section 16.5 — Lightweight URL state management (nuqs-compatible pattern).
 * Reads/writes URL search params without full navigation.
 * Supports string, number, and string[] types.
 */

type UrlStateValue = string | number | string[];

function parseFromUrl<T extends UrlStateValue>(
  key: string,
  defaultValue: T
): T {
  if (typeof window === "undefined") return defaultValue;

  const params = new URLSearchParams(window.location.search);

  if (Array.isArray(defaultValue)) {
    const values = params.getAll(key);
    return (values.length > 0 ? values : defaultValue) as T;
  }

  const raw = params.get(key);
  if (raw === null) return defaultValue;

  if (typeof defaultValue === "number") {
    const num = Number(raw);
    return (isNaN(num) ? defaultValue : num) as T;
  }

  return raw as T;
}

function writeToUrl<T extends UrlStateValue>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);

  if (Array.isArray(value)) {
    params.delete(key);
    for (const v of value) {
      params.append(key, v);
    }
  } else {
    const strValue = String(value);
    if (strValue === "") {
      params.delete(key);
    } else {
      params.set(key, strValue);
    }
  }

  const newSearch = params.toString();
  const newUrl =
    window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;

  window.history.replaceState(null, "", newUrl);
}

export function useUrlState<T extends UrlStateValue>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => parseFromUrl(key, defaultValue));

  // Sync when key changes
  useEffect(() => {
    setState(parseFromUrl(key, defaultValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      setState(value);
      writeToUrl(key, value);
    },
    [key]
  );

  // Listen for popstate (back/forward) to stay in sync
  useEffect(() => {
    const handlePopState = () => {
      setState(parseFromUrl(key, defaultValue));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setValue];
}
