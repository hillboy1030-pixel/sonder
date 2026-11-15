// Everything Sonder keeps lives in the visitor's own browser, under these keys.

export const KEYS = {
  progress: "sonder_progress_v2",
  scores: "sonder_scores",
  context: "sonder_context",
  markers: "sonder_markers",
  preview: "sonder_preview",
  report: "sonder_report",
  session: "sonder_session",
} as const;

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode). The flow still works in memory.
  }
}

export function remove(...keys: string[]) {
  try {
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
