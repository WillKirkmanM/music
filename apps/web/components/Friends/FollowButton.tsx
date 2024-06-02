"use client"

import { User } from "@prisma/client"
import follow from "@/actions/Friends/Follow"
import { Button } from "@music/ui/components/button"

type FollowButtonProps = {
  loggedInUser: User 
  userToFollow: User
}

export default function FollowButton({ loggedInUser, userToFollow }: FollowButtonProps) {
  return (
    <Button onClick={() => follow(loggedInUser, userToFollow)}>Follow</Button>
  )
}