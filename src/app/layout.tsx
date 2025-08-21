import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';


import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteDetails } from '@/data/siteDetails';
import { getImagePath } from '@/utils';

import "./globals.css";



export const metadata: Metadata = {
  metadataBase: new URL('https://xtara.ai'),
  title: siteDetails.metadata.title,
  description: siteDetails.metadata.description,
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: siteDetails.metadata.title,
    description: siteDetails.metadata.description,
    url: siteDetails.siteUrl,
    type: 'website',
    images: [
      {
        url: getImagePath('/images/og-image.jpg'),
        width: 1200,
        height: 675,
        alt: siteDetails.siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteDetails.metadata.title,
    description: siteDetails.metadata.description,
    images: [getImagePath('/images/twitter-image.jpg')],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/MonaSans-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Xtara Career Guide App",
            "image": "https://xtara.ai/images/og-image.jpg",
            "description": "Xtara helps students find the right career path through interest-based assessments, personalized learning plans, and college/course matching.",
            "brand": {
              "@type": "Brand",
              "name": "Xtara"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock"
            },
            "review": {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "Student"
              }
            },
            "url": "https://xtara.ai/"
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Xtara",
            "url": "https://xtara.ai/",
            "logo": "https://xtara.ai/images/logo-color.svg",
            "sameAs": [
              "https://www.linkedin.com/company/xtara-ai",
              "https://www.instagram.com/xtara.ai"
            ]
          })
        }}
      />

      </head>
      <body
        className="antialiased"
      >
        {siteDetails.googleAnalyticsId && <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />}
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
