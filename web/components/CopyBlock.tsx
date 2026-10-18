"use client";

import { useState } from "react";

export function CopyBlock({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("fail");
    }
  }
  return (
    <figure className="rounded-xl border border-line bg-card">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-3">
        <span className="caps">{label}</span>
        <button type="button" onClick={copy} className="inline-flex min-h-12 items-center rounded bg-act px-5 font-bold text-act-ink hover:opacity-90">
          {state === "done" ? "Copied" : "Copy message"}
        </button>
      </figcaption>
      <pre className="whitespace-pre-wrap px-6 py-5 font-sans text-[18px] leading-relaxed text-ink">{text}</pre>
      <p aria-live="polite" className="sr-only">{state === "done" ? "Message copied" : ""}</p>
      {state === "fail" && <p className="px-6 pb-4 text-[16px] text-long-ink">Your browser blocked copying. Select the text and copy it instead.</p>}
    </figure>
  );
}
