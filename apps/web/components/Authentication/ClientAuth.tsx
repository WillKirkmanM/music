"use client"

import { Button } from "@music/ui/components/button"
import { useSession } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function ClientAuth() {
  return (
    <AuthButtons />
  )
}

export function AuthButtons() {
  const session = useSession()

  return (
    <div className="flex flex-row justify-center space-x-6 items-center">
      {session.status == "unauthenticated" && <Button onClick={() => signIn()}>Sign In</Button>}
      {session.status == "authenticated" && <Button onClick={() => signOut()}>Sign Out</Button>}

      <Link href="/settings">
        <p className="text-white">Settings</p>
      </Link>
    </div>
  )
}