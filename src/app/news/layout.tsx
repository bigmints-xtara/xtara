import type { Metadata } from "next";
import { newsPageData } from "@/data/newsPageData";

export const metadata: Metadata = {
  title: newsPageData.metadata.title,
  description: newsPageData.metadata.description,
  keywords: newsPageData.metadata.keywords,
  openGraph: {
    title: newsPageData.metadata.title,
    description: newsPageData.metadata.description,
    images: [newsPageData.metadata.ogImage],
    url: newsPageData.metadata.canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: newsPageData.metadata.title,
    description: newsPageData.metadata.description,
    images: [newsPageData.metadata.ogImage],
  },
  alternates: {
    canonical: newsPageData.metadata.canonicalUrl,
  },
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 