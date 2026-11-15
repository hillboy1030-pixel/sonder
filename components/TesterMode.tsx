"use client";

import { useEffect } from "react";
import { FlaskConical, X } from "lucide-react";
import { KEYS, remove, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";

/**
 * Remembers ?tester=<code> from the URL and shows a small badge while it's on.
 * The code is only checked on the server; this just carries it along.
 */
export function TesterMode() {
  const code = useStored<string>(KEYS.tester);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tester");
    if (fromUrl) {
      writeJSON(KEYS.tester, fromUrl);
      const url = new URL(window.location.href);
      url.searchParams.delete("tester");
      window.history.replaceState(null, "", url.toString());
      window.dispatchEvent(new StorageEvent("storage", { key: KEYS.tester }));
    }
  }, []);

  if (!code) return null;
  return (
    <div className="no-print fixed bottom-3 right-3 z-[60] flex items-center gap-2 rounded-full bg-ink/85 py-1.5 pl-3 pr-1.5 font-sign text-xs text-snow shadow-lg">
      <FlaskConical size={14} aria-hidden="true" />
      Tester mode: reports are free
      <button
        onClick={() => {
          remove(KEYS.tester);
          window.dispatchEvent(new StorageEvent("storage", { key: KEYS.tester }));
        }}
        className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
        aria-label="Turn off tester mode"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
