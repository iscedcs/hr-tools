import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";

// Default metadata - individual pages can override this
export const metadata: Metadata = {
  title: {
    default: "ISCE HR Management System",
    template: "%s | ISCE HR Management",
  },
  description: "Comprehensive HR management and attendance tracking system",
  keywords: ["HR", "attendance", "management", "employee"],
  authors: [{ name: "ISCE" }],
  creator: "ISCE",
  publisher: "ISCE",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://hr-tools-beryl.vercel.app",
    siteName: "ISCE HR Management",
    title: "ISCE HR Management System",
    description: "Comprehensive HR management and attendance tracking system",
  },
  twitter: {
    card: "summary_large_image",
    title: "ISCE HR Management System",
    description: "Comprehensive HR management and attendance tracking system",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://hr-tools-beryl.vercel.app"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <NextTopLoader color="#000000" showSpinner={false} />
        {children}
        <Analytics />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
