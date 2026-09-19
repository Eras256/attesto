import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://attesto.xyz";
const SITE_DESCRIPTION =
  "x402-metered on-chain skill oracle for autonomous agents on Solana, with a built-in proof-of-fulfillment attestation layer.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Attesto — on-chain skill oracle for autonomous agents",
    template: "%s — Attesto",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/branding-attesto/svg/favicon.svg", type: "image/svg+xml" },
      {
        url: "/branding-attesto/png/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/branding-attesto/png/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: "/branding-attesto/png/favicon-32.png",
    apple: "/branding-attesto/png/favicon-180.png",
  },
  openGraph: {
    title: "Attesto — on-chain skill oracle for autonomous agents",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Attesto",
    type: "website",
    images: [
      {
        url: "/branding-attesto/png/social-og-banner-1200x630.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Attesto — on-chain skill oracle for autonomous agents",
    description: SITE_DESCRIPTION,
    images: ["/branding-attesto/png/social-og-banner-1200x630.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
