"use client"

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"

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
      {session ? (
        <>
          <Button onClick={() => signIn()}>Sign In</Button>
          <Button onClick={() => signOut()}>Sign Out</Button>
        </>
        ) : (
          <Button onClick={() => "/register"}>Register</Button>
        )}
    </>
  )
}