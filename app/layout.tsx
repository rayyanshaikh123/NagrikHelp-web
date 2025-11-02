import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "leaflet/dist/leaflet.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SmoothCursor } from "@/components/ui/smooth-cursor"
import ThemeHotkey from "@/components/theme-hotkey"
import { ThemeClickSpark } from "@/components/theme-click-spark"
import { Plus_Jakarta_Sans, Poppins } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'], 
  variable: '--font-jakarta', 
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800']
})
const poppins = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-poppins', 
  display: 'swap',
  weight: ['400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: "Civic Issue Reporter",
  description: "Crowdsourced Civic Issue Reporting & Resolution UI",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnects for Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Plus Jakarta Sans and Poppins stylesheets */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <noscript>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        </noscript>
      </head>
      <body className={`font-sans ${jakarta.variable} ${poppins.variable} ${GeistSans.variable} ${GeistMono.variable} min-h-dvh antialiased`}>
        {/* Custom smooth cursor */}
        <ThemeProvider attribute="class" enableSystem defaultTheme="system" disableTransitionOnChange>
          <ThemeClickSpark>
            <div className="smooth-cursor-scope">
              <div className="hidden md:block" aria-hidden="true">
                <SmoothCursor zIndex={2147483647} />
              </div>
              <ThemeHotkey />
              <div className="min-h-dvh">{children}</div>
            </div>
          </ThemeClickSpark>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
