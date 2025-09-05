import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Header } from "../app/components/layout/header"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Yield Cycle",
  description: "A decentralized yield farming platform.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
