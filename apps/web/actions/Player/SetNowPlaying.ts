"use server"

import prisma from "@/prisma/prisma"

export default async function SetNowPlaying(username: string, songID: string) {
  await prisma.user.update({
    where: {
      username
    },
    data: {
      nowPlaying: songID
    }
  })
}