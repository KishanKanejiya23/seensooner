import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AUTHOR, REPO_URL, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Atkinson Hyperlegible was drawn by the Braille Institute for low-vision
// readers: distinct letterforms (Il1, 0O, 5S) and open counters. On a site
// people check while worried or unwell, legibility beats personality.
const sans = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"], display: "swap", adjustFontFallback: false });

const TITLE = "Compare NHS waiting times near you";
const DESCRIPTION =
  "Live A&E and urgent care waits near you, and how long every hospital in England is taking for operations and specialist appointments. Free, independent, built on public NHS data.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${TITLE} | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: SITE_NAME,
  category: "health",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_GB", url: "/", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
  twitter: { card: "summary_large_image", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0c5f57",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className={`${sans.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-saffron focus:px-4 focus:py-3 focus:font-bold focus:text-ink"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": `${SITE_URL}/#org`,
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/icon.svg`,
                description: SITE_TAGLINE,
                founder: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
                sameAs: [REPO_URL],
              },
              {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#site`,
                url: SITE_URL,
                name: SITE_NAME,
                inLanguage: "en-GB",
                publisher: { "@id": `${SITE_URL}/#org` },
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
