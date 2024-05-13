import { Button } from "@music/ui/components/button"
import ShimmerButton from "@music/ui/components/shimmer-button"
import Link from "next/link"

export default function Setup() {
  return (
    <>
      <p className="text text-center text-4xl py-14">Setup ParsonLabs Music</p>
      <Link href="/setup/account" className="flex items-center justify-center">
        <Button>Get Started</Button>
      </Link>
    </>
  )
}