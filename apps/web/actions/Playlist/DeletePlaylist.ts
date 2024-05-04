"use server"

import prisma from "@/prisma/prisma"
import { redirect } from "next/navigation"

export async function DeletePlaylist(playlistID: string) {
  await prisma.playlist.delete({
    where: {
      id: playlistID
    }
  })
  redirect("/")
}