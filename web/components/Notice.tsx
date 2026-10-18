import type { ReactNode } from "react";

/** Inset text, the public-sector way: a thick left rule and a tinted well. */
export function Notice({ title, children, tone = "info" }: { title: string; children?: ReactNode; tone?: "info" | "warn" }) {
  return (
    <div role={tone === "warn" ? "alert" : "status"} className={`border-l-8 px-6 py-5 ${tone === "warn" ? "border-long bg-long-soft" : "border-brand-700 bg-brand-50"}`}>
      <p className="text-[20px] font-bold">{title}</p>
      {children && <div className="mt-2 text-[18px] text-ink-2">{children}</div>}
    </div>
  );
}
