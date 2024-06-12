"use server"

import prisma from "@/prisma/prisma"

export default async function SetBitrate(username: string, bitrate: number) {
  await prisma.user.update({
    where: {
      username
    },
    data: {
      bitrate
    }
  })
}