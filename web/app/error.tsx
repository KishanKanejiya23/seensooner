"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <p className="caps">Something went wrong</p>
      <h1 className="mt-3 text-[36px] font-bold tracking-[-0.02em]">This page didn&apos;t load.</h1>
      <p className="mt-4 text-ink-2">
        One of the sources we read may be slow. Try again in a moment. If you need help now, use{" "}
        <a className="prose-link" href="https://111.nhs.uk/">NHS 111</a> or call 999 in an emergency.
      </p>
      <button onClick={reset} className="mt-8 inline-flex min-h-12 items-center rounded bg-ink px-6 font-bold text-paper">Try again</button>
    </div>
  );
}
