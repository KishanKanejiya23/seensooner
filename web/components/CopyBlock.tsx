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
    <figure className="border-t-4 border-brand-700 bg-well">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
        <span className="text-[18px] font-bold">{label}</span>
        <button type="button" onClick={copy} className="inline-flex min-h-12 items-center rounded bg-brand-700 px-5 text-[18px] font-bold text-white hover:bg-brand-900">
          {state === "done" ? "Copied ✓" : "Copy message"}
        </button>
      </figcaption>
      <pre className="mx-6 mb-6 whitespace-pre-wrap border-l-4 border-saffron bg-white px-6 py-5 font-sans text-[18px] leading-relaxed text-ink">{text}</pre>
      <p aria-live="polite" className="sr-only">
        {state === "done" ? "Message copied" : ""}
      </p>
      {state === "fail" && <p className="px-6 pb-4 text-[16px] font-bold text-long-ink">Your browser blocked copying. Select the text and copy it instead.</p>}
    </figure>
  );
}
