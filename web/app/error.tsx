"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-24 sm:px-8">
      <h1 className="text-[36px]">This page didn&apos;t load.</h1>
      <p className="mt-4 text-[18px] text-ink-2">
        One of the sources we read may be slow. Try again in a moment. If you need help now, use{" "}
        <a className="link" href="https://111.nhs.uk/">NHS 111</a>, or call 999 in an emergency.
      </p>
      <button onClick={reset} className="mt-8 inline-flex min-h-12 items-center rounded bg-brand-700 px-6 text-[18px] font-bold text-white">
        Try again
      </button>
    </div>
  );
}
