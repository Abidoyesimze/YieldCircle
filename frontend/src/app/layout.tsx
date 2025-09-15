import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Header } from "../app/components/layout/header";
import { Suspense } from "react";
import { Providers } from "./components/Providers"; 

export const metadata: Metadata = {
  title: "Yield Cycle",
  description: "A decentralized yield farming platform.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <Providers>
          <Suspense fallback={<div>Loading...</div>}>
            <Header />
            {children}
          </Suspense>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}