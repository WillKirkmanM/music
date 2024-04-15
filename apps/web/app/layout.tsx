import "@/app/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { Metadata } from "next"

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

export default function RootLayout({ children }: any) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased bg-gray-600",
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}
