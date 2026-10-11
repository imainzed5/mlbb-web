import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Topbar } from "@/components/layout/Topbar";
import { createRootMetadata } from "@/lib/seo/metadata";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${geistMono.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-page-background pb-20 font-sans text-text-primary antialiased lg:pb-0">
        <Topbar />
        <div className="min-h-screen pt-14">{children}</div>
      </body>
    </html>
  );
}
