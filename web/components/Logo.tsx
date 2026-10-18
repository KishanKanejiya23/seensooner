// The mark is a take-a-number queue ticket: the one object everyone in the
// UK has held while waiting to be seen. Notched sides, a perforation, ink fill.
export function TicketMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 20) / 28} viewBox="0 0 28 20" aria-hidden="true" className="shrink-0">
      <path
        d="M3 0h22a3 3 0 0 1 3 3v4.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4.2a2.8 2.8 0 0 0 0-5.6V3a3 3 0 0 1 3-3Z"
        fill="currentColor"
      />
      <path d="M19 3.5v13" stroke="var(--paper)" strokeWidth="1.4" strokeDasharray="1.6 1.9" strokeLinecap="round" />
      <path d="M6.5 10.4 9 12.8l4.6-5.3" fill="none" stroke="var(--paper)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-ink">
      <TicketMark />
      <span className="text-[20px] font-bold tracking-[-0.02em]">SeenSooner</span>
    </span>
  );
}
