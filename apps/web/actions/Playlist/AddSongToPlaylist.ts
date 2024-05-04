"use server"

import prisma from "@/prisma/prisma";

export default async function AddSongToPlaylist(songID: string, playlistID: string) {
  await prisma?.song.upsert({
    where: { id: songID },
    create: {
      id: songID,
      playlists: {
        connect: { id: playlistID },
      },
    },
    update: {
      playlists: {
        connect: { id: playlistID },
      },
    },
  });
}