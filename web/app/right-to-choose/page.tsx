import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "@/components/CopyBlock";

export const metadata: Metadata = {
  title: "Your right to choose where you're treated",
  description: "In England you can choose which hospital your GP refers you to for most planned care, including NHS-funded private hospitals. Here's how to ask.",
  alternates: { canonical: "/right-to-choose" },
};

const MESSAGE = `Hello,

I understand I'm being referred for [specialty, e.g. orthopaedics]. Under the NHS Constitution I'd like to use my legal right to choose where I'm referred.

I've looked at current waiting times, and I'd like to be referred to [hospital name], which offers this service on the NHS.

If that isn't possible, could you tell me why, and which other options I have?

Thank you,
[Your name, date of birth]`;

const STEPS = [
  {
    t: "Compare before your appointment",
    d: "Look up the specialty you're likely to need, near you. Note two or three providers with shorter waits that you could travel to.",
  },
  {
    t: "Tell your GP you want to choose",
    d: "When your GP decides to refer you, say you'd like to use your right to choose and name the provider. You can also send the message below through your practice's online form.",
  },
  {
    t: "Check the referral",
    d: "Your referral letter or NHS App should name the provider you chose. If it doesn't, contact the surgery and ask them to change it.",
  },
];

export default function RightToChoose() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <p className="caps">Your rights in England</p>
      <h1 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.02em] sm:text-[48px]">You can choose where you&apos;re treated.</h1>
      <p className="mt-6 text-[20px] leading-relaxed text-ink-2">
        If your GP refers you to a consultant-led service for planned care, you have a legal right to choose which hospital or clinic
        you go to for your first appointment. That includes independent hospitals that treat NHS patients. It costs you nothing.
      </p>

      <h2 className="mt-14 text-[24px] font-bold">How to ask</h2>
      <ol className="mt-6 space-y-8">
        {STEPS.map((s, i) => (
          <li key={s.t} className="grid grid-cols-[48px_1fr] gap-4">
            <span className="num flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink text-[18px] font-bold">{i + 1}</span>
            <div>
              <p className="text-[20px] font-bold">{s.t}</p>
              <p className="mt-1 text-ink-2">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8">
        <Link href="/planned" className="inline-flex min-h-12 items-center rounded bg-ink px-6 font-bold text-paper hover:bg-ink-2">
          Compare waiting times near me
        </Link>
      </p>

      <h2 className="mt-14 text-[24px] font-bold">A message you can send</h2>
      <p className="mt-2 text-ink-2">Fill in the brackets. Polite and specific works best.</p>
      <div className="mt-6">
        <CopyBlock text={MESSAGE} label="To your GP surgery" />
      </div>

      <h2 className="mt-14 text-[24px] font-bold">When choice doesn&apos;t apply</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-ink-2">
        <li>Emergencies, and care that needs to happen urgently.</li>
        <li>Maternity services, and some mental health services.</li>
        <li>If you&apos;re in prison, serving in the armed forces, or detained under the Mental Health Act.</li>
        <li>The provider must offer that service on the NHS, and your clinician must agree it&apos;s suitable for your condition.</li>
        <li>This right is in England. Scotland, Wales and Northern Ireland have different rules.</li>
      </ul>

      <details className="mt-10 border-y border-line">
        <summary className="flex min-h-14 items-center justify-between py-4 text-[18px] font-bold hover:underline">
          I&apos;m already on a waiting list. Can I move? <span className="chev text-ink-3 transition-transform" aria-hidden="true">▾</span>
        </summary>
        <p className="pb-6 text-ink-2">
          Sometimes. Ask the hospital you&apos;re waiting with, or your GP, whether you can be transferred to a provider with a shorter
          wait. It isn&apos;t guaranteed, and moving can mean repeating some assessments, so ask what it would involve.
        </p>
      </details>

      <p className="mt-10 text-[16px] text-ink-3">
        Based on the NHS Constitution and the NHS Choice Framework (Department of Health and Social Care). Read the official guidance:{" "}
        <a className="prose-link" href="https://www.nhs.uk/nhs-services/hospitals/about-nhs-hospital-services/your-choices-in-the-nhs/">
          Your choices in the NHS
        </a>
        .
      </p>
    </div>
  );
}
