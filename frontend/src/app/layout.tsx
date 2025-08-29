import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import type { Metadata } from "next";

import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "sonner";

import { Providers } from "@/app/components/providers";
import { Navigation } from "@/app/components/navigation";
import FloatingBackground from "@/app/components/FloatingBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Predictum",
  description: "Create and trade prediction markets",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const _headers = await headers();
  const cookie = _headers.get("cookie");

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen dark`}>
        <Providers cookie={cookie}>
          <div className="relative min-h-screen overflow-hidden">
            <FloatingBackground />
            <Navigation />
            <main className="relative min-h-screen">{children}</main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  );
}
