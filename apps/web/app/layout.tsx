import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@music/ui/lib/utils"
import { Toaster } from "sonner"
import { Metadata } from "next"
import NavBar from "@/components/Layout/Navbar"
import Player from "@/components/Music/Player"
import Providers from "@/components/Providers/Providers"
import { Sidebar } from "@/components/Layout/Sidebar"

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
        <Providers>
          <div className="fixed top-0 left-0 z-50 w-full">
            <NavBar />
          </div>
          <div className="grid grid-cols-6 gap-4 pt-16 h-screen overflow-auto">
            <div className="col-span-1 fixed h-full overflow-auto">
              <Sidebar />
            </div>
            <div className="col-start-2 col-span-5 overflow-auto">
              {children}
            </div>
          </div>
          <Player />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}