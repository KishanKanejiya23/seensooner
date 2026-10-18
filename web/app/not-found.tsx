import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="caps">Page not found</p>
      <h1 className="mt-3 text-[36px] font-bold tracking-[-0.02em]">We couldn&apos;t find that page.</h1>
      <p className="mt-4 text-ink-2">It may have moved, or the hospital may not have reported data this month.</p>
      <p className="mt-8 flex flex-wrap gap-4">
        <Link href="/now" className="inline-flex min-h-12 items-center rounded bg-ink px-6 font-bold text-paper">Urgent care waits</Link>
        <Link href="/planned" className="inline-flex min-h-12 items-center rounded border-2 border-ink px-6 font-bold">Planned care</Link>
      </p>
    </div>
  );
}
