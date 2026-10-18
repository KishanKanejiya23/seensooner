import Link from "next/link";
import { PageBanner, PageLayout } from "@/components/Shell";

export default function NotFound() {
  return (
    <>
      <PageBanner photo="clinic" title="Page not found" lede="It may have moved, or the hospital may not have reported data this month." />
      <PageLayout trail={[{ label: "Page not found" }]}>
        <p className="text-[20px]">Try one of these instead:</p>
        <p className="mt-6 flex flex-wrap gap-4">
          <Link href="/now" className="inline-flex min-h-12 items-center rounded bg-brand-700 px-6 text-[18px] font-bold text-white">Urgent care waits</Link>
          <Link href="/planned" className="inline-flex min-h-12 items-center rounded border-2 border-brand-700 px-6 text-[18px] font-bold text-brand-700">Planned care</Link>
          <Link href="/hospitals" className="inline-flex min-h-12 items-center rounded border-2 border-brand-700 px-6 text-[18px] font-bold text-brand-700">Every hospital</Link>
        </p>
      </PageLayout>
    </>
  );
}
