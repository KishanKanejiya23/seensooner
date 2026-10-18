import type { Metadata } from "next";
import { PageBanner, PageLayout } from "@/components/Shell";
import { ISSUES_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: "How SeenSooner is built to be usable by everyone, what we test, and how to tell us about a problem.",
  alternates: { canonical: "/accessibility" },
};

export default function Accessibility() {
  return (
    <>
      <PageBanner photo="clinic" title="Accessibility statement" lede="People use this site when they're worried or unwell. It has to work for everyone." />
      <PageLayout trail={[{ label: "Accessibility statement" }]} updated="18 October 2026">
        <div className="max-w-[860px] space-y-6 text-[18px]">
          <p>We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. In practice that means:</p>
          <ul className="list-disc space-y-2 pl-6 text-ink-2">
            <li>Text is set in Atkinson Hyperlegible, a typeface designed for people with low vision, at 18px for body text.</li>
            <li>Text colours are checked for a contrast of at least 4.5 to 1, and controls for at least 3 to 1.</li>
            <li>Waiting times are never shown by colour alone: every one has a number and a written label.</li>
            <li>Everything works with a keyboard, with a visible focus outline, and there&apos;s a &ldquo;skip to main content&rdquo; link.</li>
            <li>The site works without JavaScript, apart from &ldquo;use my location&rdquo;, the hospital filter and the copy button.</li>
            <li>Pages zoom to 400% without losing content, and animations stop if your device asks for reduced motion.</li>
          </ul>
          <h2 className="pt-6 text-[30px]">Known issues</h2>
          <p className="text-ink-2">
            Small trend charts are drawn as images with a text description. The figures they summarise are written out on the same page.
          </p>
          <h2 className="pt-6 text-[30px]">Tell us about a problem</h2>
          <p className="text-ink-2">
            If anything on SeenSooner is hard to use, <a className="link" href={ISSUES_URL}>report it on GitHub</a>, and we&apos;ll fix it.
          </p>
        </div>
      </PageLayout>
    </>
  );
}
