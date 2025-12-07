import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SportsAccess",
  description: "장애인을 위한 스포츠 시설 접근성 플랫폼",
  generator: "v0.app",
  applicationName: "SportsAccess",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SportsAccess",
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        {/* Skip to Main Content - 키보드 접근성 */}
        <a
          href="#main-content"
          className="sr-only"
        >
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1 w-full max-w-screen-2xl mx-auto pt-16">{children}</main>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  )
}
