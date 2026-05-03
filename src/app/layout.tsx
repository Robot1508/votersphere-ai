import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { NetaGPT } from "@/components/NetaGPT";

const inter = Inter({
  subsets: ["latin"],
});

// Next.js 16 App Router: all <head> metadata goes through the metadata export.
// Do NOT add manual <link> or <meta> tags inside the JSX — they cause key-prop
// warnings and prerender failures.
export const metadata: Metadata = {
  title: "VoterSphere — Maharashtra 2026",
  description:
    "Civic education platform for the Maharashtra 2026 bye-elections. Explore the 3D voter journey, simulate the M3 EVM, and ask Neta-GPT your constitutional questions.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VoterSphere",
  },
  icons: {
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    title: "VoterSphere — Maharashtra 2026",
    description: "Civic education platform for the Maharashtra 2026 bye-elections.",
    type: "website",
    locale: "en_IN",
  },
};

// Viewport export — separate from metadata in Next.js 16.
// themeColor is declared in manifest.json; omitting it here avoids a
// Turbopack 16.2.4 prerender conflict on the /_global-error boundary.
// user-scalable=no is applied via the manifest and CSS touch-action on 3D pages.

import { DynamicViewport } from "@/components/DynamicViewport";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0c]">
        <DynamicViewport />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <NetaGPT />
      </body>
    </html>
  );
}
