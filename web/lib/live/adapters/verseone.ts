// Shared parser for NHS sites built on the VerseOne CMS "live service data"
// widget (University Hospitals Plymouth, Kent and Medway ICB).
import { htmlToText, parseLondonDateTime } from "../util.ts";

export interface VerseOneBlock {
  title: string;
  updatedAt: string | null;
  items: { label: string; value: string }[];
}

export function parseVerseOne(html: string): VerseOneBlock[] {
  const blocks: VerseOneBlock[] = [];
  const parts = html.split(/class="[^"]*\blive-service-data-wrapper\b[^"]*"/i).slice(1);
  for (const seg of parts) {
    const titleM = seg.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    const timeM = seg.match(/<time[^>]*class="last-updated"[^>]*>([\s\S]*?)<\/time>/i);
    // Blocks without a machine-updated timestamp are hand-edited static text; skip them.
    if (!titleM || !timeM) continue;
    const timeRef = htmlToText(timeM[1].match(/class="time-ref"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
    const dateRef = htmlToText(timeM[1].match(/class="date-ref"[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "");
    const items: { label: string; value: string }[] = [];
    const itemRe = /<h[34][^>]*>([\s\S]*?)<\/h[34]>\s*<\/header>\s*<article[^>]*data-display[^>]*>([\s\S]*?)<\/article>/gi;
    let m: RegExpExecArray | null;
    while ((m = itemRe.exec(seg))) items.push({ label: htmlToText(m[1]), value: htmlToText(m[2]) });
    blocks.push({ title: htmlToText(titleM[1]), updatedAt: parseLondonDateTime(`${timeRef} ${dateRef}`), items });
  }
  return blocks;
}

export function item(block: VerseOneBlock, re: RegExp): string | null {
  return block.items.find((i) => re.test(i.label))?.value ?? null;
}
