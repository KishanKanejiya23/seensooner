import { ALL_PROVIDERS, RTT_PERIOD, getProvider, providerWaits, weeks } from "@/lib/rtt";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Hospital waiting times on SeenSooner";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return ALL_PROVIDERS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProvider((await params).slug);
  const total = p ? providerWaits(p.code).find((w) => w.s === "C_999") : undefined;
  return ogCard({
    kicker: `Waiting times, ${RTT_PERIOD}`,
    title: p?.name ?? "Hospital waiting times",
    line: total ? `Median wait ${weeks(total.median)} · ${Math.round(total.within18)}% within 18 weeks` : undefined,
  });
}
