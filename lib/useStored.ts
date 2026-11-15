"use client";

import { useMemo, useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/**
 * Reads a JSON value from localStorage without a hydration mismatch.
 * Returns `undefined` during server render / before hydration, then the parsed value or null.
 */
export function useStored<T>(key: string): T | null | undefined {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => undefined
  );
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}
