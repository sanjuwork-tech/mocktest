import type { Metadata } from "next";
import { siteConfig } from "@/data/catalog";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  keywords?: string[],
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    ...(keywords?.length ? { keywords } : {}),
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description,
      url: path,
      images: [
        {
          url: "/brand-share.png",
          width: 1200,
          height: 630,
          alt: "TestDisha — discover more after Class 12",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ["/brand-share.png"],
    },
  };
}
