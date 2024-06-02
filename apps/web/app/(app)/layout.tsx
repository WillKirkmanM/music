import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@music/ui/lib/utils"
import { Toaster } from "sonner"
import { Metadata, Viewport } from "next"
import NavBar from "@/components/Layout/Navbar"
import Player from "@/components/Music/Player"
import Providers from "@/components/Providers/Providers"
import Sidebar from "@/components/Layout/Sidebar"
import QueuePanel from "@/components/Music/Queue/QueuePanel"
import LyricsOverlay from "@/components/Lyrics/LyricsOverlay"
import { Suspense } from "react"
import FriendActivity from "@/components/Friends/FriendActivity"
import Playlists from "@/components/Layout/Playlists"
import { Separator } from "@music/ui/components/separator"
import TopGradient from "@/components/Layout/TopGradient"

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
          "min-h-screen font-sans antialiased bg-black text-white",
          fontSans.variable
        )}
      >
        <Providers>
          <TopGradient />
          <div className="fixed top-0 left-0 z-50 w-full">
            <NavBar />
          </div>

            <Sidebar sidebarContent={
              <>
              <Separator className="bg-gray-800"/>
                <Suspense>
                  <FriendActivity />
                </Suspense>

                <Suspense>
                  <Playlists />
                </Suspense>
              </>
            }>

            <QueuePanel>
              <LyricsOverlay>
                {children}
              </LyricsOverlay>
            </QueuePanel>
          </Sidebar>

          <Player />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}