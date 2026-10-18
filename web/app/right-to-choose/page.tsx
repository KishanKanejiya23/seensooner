import type { Metadata } from "next";
import Link from "next/link";
import { CopyBlock } from "@/components/CopyBlock";
import { JsonLd } from "@/components/JsonLd";
import { PageBanner, PageLayout } from "@/components/Shell";

export const metadata: Metadata = {
  title: "Your right to choose where you're treated on the NHS",
  description:
    "In England you can choose which hospital your GP refers you to for most planned care, including NHS-funded private hospitals. How to ask, a message you can send, and when choice doesn't apply.",
  alternates: { canonical: "/right-to-choose" },
};

const MESSAGE = `Hello,

I understand I'm being referred for [specialty, e.g. orthopaedics]. Under the NHS Constitution I'd like to use my legal right to choose where I'm referred.

I've looked at current waiting times, and I'd like to be referred to [hospital name], which offers this service on the NHS.

If that isn't possible, could you tell me why, and which other options I have?

Thank you,
[Your name, date of birth]`;

const STEPS = [
  { t: "Compare before your appointment", d: "Look up the specialty you're likely to need, near you. Note two or three providers with shorter waits that you could get to." },
  { t: "Tell your GP you want to choose", d: "When your GP decides to refer you, say you'd like to use your right to choose and name the provider. You can also send the message below through your surgery's online form." },
  { t: "Check the referral", d: "Your referral letter or the NHS App should name the provider you chose. If it doesn't, contact the surgery and ask them to change it." },
];

const FAQ = [
  {
    q: "Can I choose which hospital I'm referred to?",
    a: "Yes, in England. If your GP refers you to a consultant-led service for planned care, you have a legal right to choose the hospital or clinic for your first appointment, including independent hospitals that offer the service on the NHS.",
  },
  { q: "Does choosing a private hospital cost anything?", a: "No. If the independent hospital treats NHS patients for that service, your care is NHS-funded and free." },
  {
    q: "When doesn't the right to choose apply?",
    a: "Emergencies and urgent care, maternity services, some mental health services, and if you are in prison, serving in the armed forces or detained under the Mental Health Act. It is a right in England only.",
  },
  {
    q: "I'm already on a waiting list. Can I move?",
    a: "Sometimes. Ask the hospital you're waiting with, or your GP, whether you can be transferred to a provider with a shorter wait. It isn't guaranteed, and moving can mean repeating some assessments.",
  },
];

export default function RightToChoose() {
  return (
    <>
      <PageBanner photo="blue-chairs" kicker="Your rights in England" title="You can choose where you're treated" lede="It's the law, it's free, and most people are never told. Here's how to use it." />
      <PageLayout trail={[{ label: "Right to choose" }]} current="/right-to-choose" updated="18 October 2026">
        <div className="max-w-[860px]">
          <p className="text-[20px]">
            If your GP refers you to a consultant-led service for planned care, you have a legal right to choose which hospital or clinic
            you go to for your first appointment. That includes independent hospitals that treat NHS patients. It costs you nothing.
          </p>

          <h2 className="mt-14 text-[30px]">How to ask, in three steps</h2>
          <ol className="mt-8 space-y-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className="grid grid-cols-[56px_1fr] gap-5">
                <span className="num flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-[24px] font-bold text-white">{i + 1}</span>
                <div>
                  <h3 className="text-[22px]">{s.t}</h3>
                  <p className="mt-1 text-[18px] text-ink-2">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-10">
            <Link href="/planned" className="inline-flex min-h-12 items-center rounded bg-brand-700 px-6 text-[18px] font-bold text-white hover:bg-brand-900">
              Compare waiting times near me
            </Link>
          </p>

          <h2 className="mt-16 text-[30px]">A message you can send</h2>
          <p className="mt-2 text-[18px] text-ink-2">Fill in the brackets. Polite and specific works best.</p>
          <div className="mt-6">
            <CopyBlock text={MESSAGE} label="To your GP surgery" />
          </div>

          <h2 className="mt-16 text-[30px]">Common questions</h2>
          <div className="mt-6 border-t border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="border-b border-line">
                <summary className="flex min-h-14 items-center justify-between gap-4 py-4 text-[20px] font-bold hover:text-brand-600">
                  {f.q} <span className="chev text-[16px] text-ink-3 transition-transform" aria-hidden="true">▼</span>
                </summary>
                <p className="pb-6 text-[18px] text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-10 text-[16px] text-ink-2">
            Based on the NHS Constitution and the NHS Choice Framework (Department of Health and Social Care). Official guidance:{" "}
            <a className="link" href="https://www.nhs.uk/nhs-services/hospitals/about-nhs-hospital-services/your-choices-in-the-nhs/">
              Your choices in the NHS
            </a>
            .
          </p>
        </div>
      </PageLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
