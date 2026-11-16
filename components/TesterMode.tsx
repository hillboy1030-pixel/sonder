"use client";

import { useEffect } from "react";
import { FlaskConical, X } from "lucide-react";
import { KEYS, remove, writeJSON } from "@/lib/storage";
import { useStored } from "@/lib/useStored";

/**
 * Early access: remembers ?tester=<code> from the URL and shows a small badge
 * while it's on. The code is only checked on the server; this just carries it
 * along. ?devtools=1 also shows "skip the questions" (for Jesse's own testing).
 */
export function TesterMode() {
  const code = useStored<string>(KEYS.tester);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("tester");
    const devtools = params.get("devtools");
    if (!fromUrl && !devtools) return;
    if (fromUrl) writeJSON(KEYS.tester, fromUrl);
    if (devtools === "1") writeJSON(KEYS.devtools, true);
    if (devtools === "0") remove(KEYS.devtools);
    const url = new URL(window.location.href);
    url.searchParams.delete("tester");
    url.searchParams.delete("devtools");
    window.history.replaceState(null, "", url.toString());
    window.dispatchEvent(new StorageEvent("storage", { key: KEYS.tester }));
    window.dispatchEvent(new StorageEvent("storage", { key: KEYS.devtools }));
  }, []);

  if (!code) return null;
  return (
    <div className="no-print fixed bottom-3 right-3 z-[60] flex items-center gap-2 rounded-full bg-ink/85 py-1.5 pl-3 pr-1.5 font-sign text-xs text-snow shadow-lg">
      <FlaskConical size={14} aria-hidden="true" />
      Early access: everything is free
      <button
        onClick={() => {
          remove(KEYS.tester);
          window.dispatchEvent(new StorageEvent("storage", { key: KEYS.tester }));
        }}
        className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/15"
        aria-label="Turn off early access"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}
