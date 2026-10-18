import { OG_SIZE, ogCard } from "@/lib/og";

export const alt = "SeenSooner: find out how long you'll wait, before you go";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({ kicker: "Live A&E waits and hospital waiting lists", title: "Find out how long you'll wait, before you go.", line: "Free and independent, built on public NHS data" });
}
