import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

let font: Promise<ArrayBuffer | null> | null = null;
/** Atkinson Hyperlegible Next Bold from Google Fonts, fetched once at build. Falls back to the default face. */
function atkinson() {
  font ??= (async () => {
    try {
      const css = await (await fetch("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@700", { headers: { "user-agent": "Mozilla/4.0" } })).text();
      const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
      return url ? await (await fetch(url)).arrayBuffer() : null;
    } catch {
      return null;
    }
  })();
  return font;
}

/** One share-card layout for every page: teal field, saffron marker, ticket mark, big claim. */
export async function ogCard({ kicker, title, line }: { kicker: string; title: string; line?: string }) {
  const data = await atkinson();
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#073b37", color: "#fff", padding: "64px 72px", fontFamily: "Atkinson" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="46" viewBox="0 0 28 20">
            <path d="M3 0h22a3 3 0 0 1 3 3v4.2a2.8 2.8 0 0 0 0 5.6V17a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-4.2a2.8 2.8 0 0 0 0-5.6V3a3 3 0 0 1 3-3Z" fill="#ffffff" />
            <path d="M6.5 10.4 9 12.8l4.6-5.3" fill="none" stroke="#073b37" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40 }}>SeenSooner</span>
            <span style={{ fontSize: 24, color: "#d7ebe7" }}>Independent NHS waiting-time guide</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", borderLeft: "12px solid #f2b134", paddingLeft: 36 }}>
          <span style={{ fontSize: 30, color: "#f2b134" }}>{kicker}</span>
          <span style={{ fontSize: title.length > 60 ? 54 : 68, lineHeight: 1.1, marginTop: 12 }}>{title}</span>
          {line && <span style={{ fontSize: 30, color: "#d7ebe7", marginTop: 20 }}>{line}</span>}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: data ? [{ name: "Atkinson", data, weight: 700, style: "normal" }] : undefined },
  );
}
