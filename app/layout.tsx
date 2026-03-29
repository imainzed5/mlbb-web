import type { Metadata } from "next";

import { Topbar } from "@/components/layout/Topbar";
import { createRootMetadata } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = createRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-page-background pb-24 font-sans text-text-primary antialiased sm:pb-0">
        <Topbar />
        <div className="min-h-screen pt-14 sm:pt-16">{children}</div>
      </body>
    </html>
  );
}
