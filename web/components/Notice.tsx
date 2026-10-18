import type { ReactNode } from "react";

/** Error / empty / stale states: what happened, and what to do next. */
export function Notice({ title, children, tone = "info" }: { title: string; children?: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div role={tone === "warn" ? "alert" : "status"} className={`rounded-xl border-l-4 px-6 py-5 ${tone === "warn" ? "border-long bg-long-soft" : "border-act bg-act-soft"}`}>
      <p className="text-[18px] font-bold">{title}</p>
      {children && <div className="mt-2 text-ink-2">{children}</div>}
    </div>
  );
}
