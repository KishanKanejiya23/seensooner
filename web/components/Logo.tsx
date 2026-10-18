// The mark is a take-a-number queue ticket: the one object everyone in the
// UK has held while waiting to be seen. Notched sides, a perforation, a tick.
export function TicketMark({ size = 36, tone = "brand" }: { size?: number; tone?: "brand" | "light" }) {
  const fill = tone === "brand" ? "var(--brand-700)" : "#ffffff";
  const cut = tone === "brand" ? "#ffffff" : "var(--brand-900)";
  return (
    <svg width={size} height={(size * 20) / 28} viewBox="0 0 28 20" aria-hidden="true" className="shrink-0">
      <path
        d="M3 0h22a3 3 0 0 1 3 3v4.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4.2a2.8 2.8 0 0 0 0-5.6V3a3 3 0 0 1 3-3Z"
        fill={fill}
      />
      <path d="M19 3.5v13" stroke={cut} strokeWidth="1.4" strokeDasharray="1.6 1.9" strokeLinecap="round" />
      <path d="M6.5 10.4 9 12.8l4.6-5.3" fill="none" stroke={tone === "brand" ? "var(--saffron)" : cut} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ tone = "brand" }: { tone?: "brand" | "light" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${tone === "brand" ? "text-ink" : "text-white"}`}>
      <TicketMark tone={tone} />
      <span className="flex flex-col leading-none">
        <span className="text-[24px] font-bold tracking-[-0.01em]">SeenSooner</span>
        <span className={`mt-1 text-[14px] ${tone === "brand" ? "text-ink-3" : "text-brand-100"}`}>Independent NHS waiting-time guide</span>
      </span>
    </span>
  );
}
