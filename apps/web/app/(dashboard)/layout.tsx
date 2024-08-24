import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import pl from "@/assets/pl-tp.png"
import SettingsSidebar from "@/components/Layout/Settings/Sidebar"
import { cn } from "@music/ui/lib/utils"
import Link from "next/link"
import { Metadata } from "next"
import Image from "next/image"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ParsonLabs Music"
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased bg-gray-900 texxt-white",
          fontSans.variable
        )}>
          <Link href="/home">
          <div className="flex flex-row text-white items-center font-bold pl-4 pt-3 fixed z-50">
            <Image src={pl} alt="ParsonLabs" height={30} width={30}/>
            <div className="md:text-xl text-white font-bold pl-3">
                ParsonLabs Music
            </div>
          </div>
          </Link>
          <div className="fixed left-0 top-0 h-full w-1/4 flex items-center justify-center">
            <SettingsSidebar />
          </div>
          {children}
      </body>
    </html>
  )
}


