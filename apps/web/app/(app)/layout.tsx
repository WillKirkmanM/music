import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { Metadata, Viewport } from "next"
import MainLayout from "./main-layout"

export const metadata: Metadata = {
  applicationName: "ParsonLabs Music",
  title: {
    default: "ParsonLabs Music",
    template: "%s | ParsonLabs Music"
  },
  description: "Own your music.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ParsonLabs Music",
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    title: {
      default: "ParsonLabs Music",
      template: "%s | ParsonLabs Music"
    },
    description: "Own your music."
  }
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default async function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  )
}