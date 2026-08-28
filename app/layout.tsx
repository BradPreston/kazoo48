import type { Metadata } from "next";
import { Inter } from "next/font/google";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = "https://kazoo48.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kazoo 48",
  description:
    "Kazoo 48 is a 48 hour film festival in Kalamazoo, MI. Make a movie in 48 hours and premiere it on the big screen.",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kazoo 48",
  alternateName: "Kazoo 48 Hour Film Festival",
  url: siteUrl,
  logo: `${siteUrl}/images/kazoo48-logo.webp`,
  description:
    "Kazoo 48 is a non-profit 48 hour film festival in Kalamazoo, MI. Make a movie in 48 hours and premiere it on the big screen.",
  foundingDate: "2019",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kalamazoo",
    addressRegion: "MI",
    addressCountry: "US",
  },
  sameAs: [
    "https://www.facebook.com/kazoo48film",
    "https://www.instagram.com/kazoo48hourfilm/",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd data={organizationJsonLd} />
        {children}
      </body>
    </html>
  );
}
