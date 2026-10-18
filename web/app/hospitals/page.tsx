import type { Metadata } from "next";
import { HospitalFilter } from "@/components/HospitalFilter";
import { PageBanner, PageLayout } from "@/components/Shell";
import { ALL_PROVIDERS, RTT_PERIOD } from "@/lib/rtt";

export const metadata: Metadata = {
  title: "Every NHS hospital and provider in England",
  description: `Waiting times for ${ALL_PROVIDERS.length} NHS trusts and independent providers in England, by specialty. NHS England data for ${RTT_PERIOD}.`,
  alternates: { canonical: "/hospitals" },
};

export default function Hospitals() {
  const providers = ALL_PROVIDERS.map((p) => ({ code: p.code, slug: p.slug, name: p.name, nhs: p.nhs, town: p.town, region: p.region ?? "Other" })).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  return (
    <>
      <PageBanner photo="clinic" kicker={`${ALL_PROVIDERS.length} providers in England`} title="Every hospital" lede={`NHS trusts and independent hospitals that reported planned-care waits for ${RTT_PERIOD}.`} />
      <PageLayout trail={[{ label: "Hospitals" }]} current="/hospitals">
        <HospitalFilter providers={providers} />
      </PageLayout>
    </>
  );
}
