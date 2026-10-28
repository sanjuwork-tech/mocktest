import type { Metadata } from "next";
import { siteConfig } from "@/data/catalog";

type ArticleInfo = { publishedTime: string; modifiedTime: string; section?: string };

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  keywords?: string[],
  article?: ArticleInfo,
): Metadata {
  const image = {
    url: "/brand-share.png",
    width: 1200,
    height: 630,
    alt: "OurMocks — discover more after Class 12",
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    ...(keywords?.length ? { keywords } : {}),
    openGraph: article
      ? {
          type: "article",
          locale: "en_IN",
          siteName: siteConfig.name,
          title,
          description,
          url: path,
          images: [image],
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          ...(article.section ? { section: article.section } : {}),
        }
      : {
          type: "website",
          locale: "en_IN",
          siteName: siteConfig.name,
          title: `${title} | ${siteConfig.name}`,
          description,
          url: path,
          images: [image],
        },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: ["/brand-share.png"],
    },
  };
}
