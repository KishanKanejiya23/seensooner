// Small, purposeful icons only: each one sits next to a label it reinforces.
type P = { className?: string };

export function ClockIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l3.5 2" strokeLinecap="round" className="clock-hand" />
    </svg>
  );
}
export function SearchIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" strokeLinecap="round" />
    </svg>
  );
}
export function PhoneIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" />
    </svg>
  );
}
export function PinIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}
export function ArrowIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M5 12h13m-5-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function RefreshIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function MenuIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

/* Values strip icons: drawn for this site, in one line weight. */
export function HonestIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 38V22M20 38V12M30 38V26M40 38V16" />
      <path d="M6 38h38" />
    </svg>
  );
}
export function OpenIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="17" cy="17" r="6" />
      <circle cx="33" cy="19" r="5" />
      <path d="M6 38c1.5-7 6-11 11-11s9.5 4 11 11M27 30c1.5-3 3.6-4.6 6-4.6 4 0 7.4 3.8 8.6 12.6" />
    </svg>
  );
}
export function CareIcon({ className = "" }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 39S9 30.5 9 19.5A7.5 7.5 0 0 1 24 15a7.5 7.5 0 0 1 15 4.5C39 30.5 24 39 24 39Z" />
      <path d="M24 21v9M19.5 25.5h9" />
    </svg>
  );
}
