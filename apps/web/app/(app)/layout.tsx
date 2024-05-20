import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@music/ui/lib/utils"
import { Toaster } from "sonner"
import { Metadata, Viewport } from "next"
import NavBar from "@/components/Layout/Navbar"
import Player from "@/components/Music/Player"
import Providers from "@/components/Providers/Providers"
import { Sidebar } from "@/components/Layout/Sidebar"
import QueuePanel from "@/components/Music/Queue/QueuePanel"
import LyricsOverlay from "@/components/Lyrics/LyricsOverlay"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

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
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased bg-gray-600",
          fontSans.variable
        )}
      >
        <Providers>
          <div className="fixed top-0 left-0 z-50 w-full">
            <NavBar />
          </div>
          <div className="px-2 md:px-0 grid grid-cols-1 md:grid-cols-6 gap-4 pt-16 h-screen overflow-auto">
            <div className="hidden md:block md:col-span-1 fixed h-full overflow-auto">
              <Sidebar />
            </div>
            <div className="col-start-1 md:col-start-2 md:col-span-5 overflow-auto">
              <QueuePanel>
                <LyricsOverlay>
                  {children}
                </LyricsOverlay>
              </QueuePanel>
            </div>
          </div>
          <Player />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}