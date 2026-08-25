import type { Metadata, Viewport } from "next";
import { wedding } from "@/data/wedding";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(wedding.site.url),
  title: wedding.site.title,
  description: wedding.site.description,
  applicationName: "Wedding Invitation",
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg"
  },
  openGraph: {
    title: wedding.site.title,
    description: wedding.site.description,
    type: "website",
    locale: wedding.site.locale,
    url: "/",
    images: [
      {
        url: "/opengraph-preview.svg",
        width: 1200,
        height: 630,
        alt: "Kodagu wedding invitation"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: wedding.site.title,
    description: wedding.site.description,
    images: ["/opengraph-preview.svg"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f2e8"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
