export const SITE_URL = (process.env.SITE_URL ?? "https://seensooner.kishankanejiiya.tech").replace(/\/$/, "");
export const SITE_NAME = "SeenSooner";
export const SITE_TAGLINE = "Independent NHS waiting-time guide";
export const NHS_111 = "https://111.nhs.uk/";
export const REPO_URL = "https://github.com/KishanKanejiya23/seensooner";
export const ISSUES_URL = `${REPO_URL}/issues/new`;
export const AUTHOR = { name: "Kishan Kanejiya", url: "https://linkedin.com/in/kishankanejiya" };

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/now", label: "Urgent care now" },
  { href: "/planned", label: "Planned care" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/where-to-go", label: "Where to go" },
  { href: "/right-to-choose", label: "Right to choose" },
  { href: "/about", label: "About us" },
] as const;
