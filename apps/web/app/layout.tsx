import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@music/ui/lib/utils"
import { Toaster } from "sonner"
import { Metadata } from "next"
import NavBar from "@/components/Layout/Navbar"
import Player from "@/components/Music/Player"
import { PlayerProvider } from "@/components/Music/Player/usePlayer"
import { Sidebar } from "@/components/Layout/Sidebar"
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "ParsonLabs Music",
    template: "%s | ParsonLabs Music"
  }
}

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
        <PlayerProvider>
          <div className="fixed top-0 left-0 z-50 w-full-auto">
            <NavBar />
          </div>
          <div className="grid lg:grid-cols-6 fixed h-screen overflow-auto">
              <Sidebar />
          </div>
            <div className="col-start-2 col-span-7 overflow-auto">
              {children}
          </div>
          <Player />
          <Toaster />
        </PlayerProvider>
      </body>
    </html>
  )
}
