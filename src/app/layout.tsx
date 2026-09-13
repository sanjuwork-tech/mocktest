import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, Newsreader } from "next/font/google";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/data/catalog";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], display: "swap" });
const dmMono = DM_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "MockStride — Mock Tests for CUET, IAT, NEST & COMEDK", template: "%s | MockStride" },
  description: siteConfig.shortDescription,
  keywords: ["online mock tests", "test series 2026", "CUET UG mock tests", "IISER IAT mock tests", "NISER NEST test series", "COMEDK mock tests", "entrance exam preparation"],
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_IN", siteName: siteConfig.name, title: "MockStride — Practice like it is exam day", description: siteConfig.shortDescription, url: "/", images: [{ url: "/mockstride-logo-concept.png", width: 2048, height: 2048, alt: "MockStride" }] },
  twitter: { card: "summary_large_image", title: "MockStride", description: siteConfig.shortDescription, images: ["/mockstride-logo-concept.png"] },
};

export const viewport: Viewport = { themeColor: "#071A4D", colorScheme: "light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const structuredData = { "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: siteConfig.url, logo: `${siteConfig.url}/logo-mark.svg`, description: siteConfig.shortDescription };
  return (
    <html lang="en" className={`${bricolage.variable} ${newsreader.variable} ${dmMono.variable}`}>
      <body><SiteHeader />{children}<SiteFooter /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /></body>
    </html>
  );
}
