"use client"
import { Button } from "@/components/ui/button"
import { signIn, signOut } from "next-auth/react"

export default function ClientAuth() {
  return (
    <>
      <Button onClick={() => signIn()}>Sign In</Button>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </>
  )
}