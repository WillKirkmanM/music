"use server"

import prisma from "@/prisma/prisma"
import getConfig from "../Config/getConfig"
import { Library } from "@/types/Music/Library"

export default async function GetListenHistory(username: string, unique = false) {
  const listenHistory = await prisma.user.findUnique({
    where: {
      username
    },
    include: {
      listenHistory: {
        orderBy: {
          listenedAt: 'desc',
        },
      },
    }
  })

  if (!listenHistory) return []

  const listenHistorySongIds = listenHistory.listenHistory.map(historyItem => historyItem.songId)

  const config = await getConfig()
  if (!config) return []

  const typedLibrary: Library = JSON.parse(config)
  if (Object.keys(typedLibrary).length === 0) {
    return []
  }

  const allSongs = typedLibrary.flatMap((artist) =>
    artist.albums.flatMap((album) =>
      (album.songs.filter(Boolean) as any[]).map((song) => ({
        ...song,
        artistObject: artist,
        albumObject: album,
        album: album.name,
        image: album.cover_url,
      }))
    )
  )

  let listenHistorySongs = allSongs.filter(song => listenHistorySongIds.includes(String(song.id)))

  if (unique) {
    const uniqueSongIds = Array.from(new Set(listenHistorySongIds))
    listenHistorySongs = listenHistorySongs.filter(song => uniqueSongIds.includes(String(song.id)))
  }

  return listenHistorySongs
}