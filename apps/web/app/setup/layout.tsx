import "@music/ui/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@music/ui/lib/utils"
import { Metadata, Viewport } from "next"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Setup | ParsonLabs Music",
    template: "%s | ParsonLabs Music"
  },
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
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}