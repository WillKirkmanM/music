"use server"

import prisma from "@/prisma/prisma";

export default async function GetPlaylist(username: string) {
  const playlists = prisma?.playlist.findMany({
    where: {
      users: {
        some: {
          username: username
        }
      }
    }
  })
 
  return playlists
}