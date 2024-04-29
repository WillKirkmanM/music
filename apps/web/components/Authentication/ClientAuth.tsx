"use client"

import { Button } from "@music/ui/button"
import { useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"
import Link from "next/link"

export default function ClientAuth() {
  return (
    <>
      <SessionProvider>
        <AuthButtons />
      </SessionProvider>
    </>
  )
}

export function AuthButtons() {
  const session = useSession()

  return (
    <>
      {session.status == "authenticated" ? (
        <>
        <div className="flex flex-row justify-center">
          <Button onClick={() => signIn()}>Sign In</Button>
          <Button onClick={() => signOut()}>Sign Out</Button>
          <Link href="/settings">
            <p className="text-white">Settings</p>
          </Link>
        </div>
        </>
      ) : (
        <>
        <div className="flex flex-row justify-center">
          <Button onClick={() => signIn()}>Sign In</Button>
          <Button onClick={() => signOut()}>Sign Out</Button>
          <Link href="/register">
            <p className="text-white">Register</p>
          </Link>
        </div>
        </>
      )}
    </>
  )
}