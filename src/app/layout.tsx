import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/catalog";
import { PageMotion } from "@/components/motion/page-motion";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
});
const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "TestDisha — Discover More After Class 12",
    template: "%s | TestDisha",
  },
  description: siteConfig.shortDescription,
  keywords: [
    "online mock tests",
    "test series 2026",
    "CUET UG mock tests",
    "IISER IAT mock tests",
    "NISER NEST test series",
    "COMEDK mock tests",
    "entrance exam preparation",
  ],
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: "TestDisha — Discover More After Class 12",
    description: siteConfig.shortDescription,
    url: "/",
    images: [
      { url: "/brand-share.png", width: 1200, height: 630, alt: "TestDisha" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TestDisha",
    description: siteConfig.shortDescription,
    images: ["/brand-share.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#071A4D",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo-mark.svg`,
    description: siteConfig.shortDescription,
  };
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${newsreader.variable} ${dmMono.variable}`}
    >
      <body>
        <SiteHeader />
        <PageMotion />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
