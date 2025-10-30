import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarLayout } from "../components/sidebar-layout"
import { SessionProvider } from "@/lib/hooks/SessionProvider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Endurance Training",
  description: "Dark minimalist endurance training app",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable} antialiased theme-default`}>
        <SessionProvider>
          <SidebarLayout>{children}</SidebarLayout>
        </SessionProvider>
      </body>
    </html>
  )
}
