"use server"

import prisma from "@/prisma/prisma"
import { redirect } from "next/navigation"

export default async function CreatePlaylist(name: string, username: string) {
  "use server"
  const user = await prisma.user.findFirst({ where: { username: username } })

  if (!user) {
    throw new Error(`User with username ${username} not found`)
  }

  const playlist = await prisma.playlist.create({
    data: {
      name,
      users: {
        connect: [{
          username: username,
          id: user.id
        }]
      }
    }
  })

  redirect(`/playlist/${playlist.id}`)
}