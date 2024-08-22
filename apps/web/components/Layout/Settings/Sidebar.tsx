"use client"

import getSession from "@/lib/Authentication/JWT/getSession"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function SettingsSidebar() {
  const session = getSession()
  const isAdmin = session?.role === "admin"

  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPath(pathname)
  }, [pathname])

  if (currentPath === null) {
    return null
  }

  return (
    <div className="grid gap-4 text-2xl text-muted-foreground text-white" draggable="false" style={{ userSelect: "none" }}>
      <Link href="/settings" className={`font-semibold ${currentPath === "/settings" ? "font-bold" : "text-primary"} user-select-none`}>General</Link>
      {isAdmin && (
        <Link href="/settings/users" className={`${currentPath === "/settings/users" ? "font-bold" : ""} user-select-none`}>Users</Link>
      )}
    </div>
  )
}