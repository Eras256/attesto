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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Attesto — on-chain skill oracle for autonomous agents",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Attesto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attesto — on-chain skill oracle for autonomous agents",
    description: SITE_DESCRIPTION,
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
