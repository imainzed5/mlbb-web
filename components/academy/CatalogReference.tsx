"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AcademyEntry, AcademyKind } from "@/lib/academy/types";
import { actionClass } from "@/components/explore/ExploreShell";

export function CatalogReference({ kind, name, id }: { kind: AcademyKind; name: string; id?: string | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<AbortController | null>(null);
  const [entry, setEntry] = useState<AcademyEntry | null>(null);
  const [status, setStatus] = useState("idle");
  useEffect(() => () => pending.current?.abort(), []);
  function close() { pending.current?.abort(); dialog.current?.close(); }
  async function open() {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setEntry(null); setStatus("loading");
    dialog.current?.showModal();
    try {
      const query = new URLSearchParams({ name });
      if (id) query.set("id", id);
      const response = await fetch(`/api/academy/${kind}?${query}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Catalog unavailable");
      const payload = await response.json();
      if (controller.signal.aborted) return;
      setEntry(payload.entry ?? null); setStatus(payload.entry ? "ready" : "missing");
    } catch {
      if (!controller.signal.aborted) setStatus("error");
    }
  }
  return <>
    <button type="button" onClick={open} className="text-left text-accent-text underline decoration-accent-text/40 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary" aria-haspopup="dialog">{name}</button>
    <dialog ref={dialog} onCancel={() => pending.current?.abort()} onClick={event => { if (event.target === dialog.current) close(); }} className="m-auto max-h-[85dvh] w-[min(92vw,560px)] overflow-y-auto rounded-2xl border border-border-subtle bg-card-surface p-6 text-text-primary shadow-xl backdrop:bg-black/70" aria-label={`${name} reference`}>
      <div className="flex items-start justify-between gap-4"><h2 className="text-xl font-semibold">{entry?.name ?? name}</h2><button type="button" onClick={close} className={actionClass} autoFocus>Close</button></div>
      <div className="mt-5 space-y-4" aria-live="polite">
        {status === "loading" && <p>Loading reference…</p>}
        {status === "missing" && <p>No unique catalog entry is available for this build reference. Its original description remains on the build card.</p>}
        {status === "error" && <><p>The reference is temporarily unavailable.</p><button type="button" className={actionClass} onClick={open}>Retry</button></>}
        {entry && <><p className="text-sm text-accent-text">{entry.category}</p><p className="whitespace-pre-line text-sm leading-6">{entry.attributes}</p><p className="whitespace-pre-line text-sm leading-6">{entry.description || "No additional effects are published."}</p><Link className={actionClass} onClick={close} href={`/academy/${kind}/${entry.id}`}>Open full reference</Link></>}
      </div>
    </dialog>
  </>;
}
