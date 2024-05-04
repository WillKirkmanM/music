"use server"

import prisma from "@/prisma/prisma";

export default async function GetPlaylists(username: string) {
  const playlists = prisma?.playlist.findMany({
    where: {
      users: {
        some: {
          username: username
        }
      }
    },
    include: {
      songs: true
    }
  })
 
  return playlists
}