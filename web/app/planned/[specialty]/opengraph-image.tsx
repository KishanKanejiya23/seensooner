import { RTT_PERIOD, SPECIALTIES, getSpecialty, spread, weeks } from "@/lib/rtt";
import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Specialty waiting times across England on SeenSooner";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ specialty: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ specialty: string }> }) {
  const s = getSpecialty((await params).specialty);
  const sp = s ? spread(s.code) : null;
  return ogCard({
    kicker: `England, ${RTT_PERIOD}`,
    title: `${s?.name ?? "Specialty"} waiting times at every hospital`,
    line: sp ? `From ${weeks(sp.fastest.median)} to ${weeks(sp.slowest.median)} depending on where you go` : undefined,
  });
}
