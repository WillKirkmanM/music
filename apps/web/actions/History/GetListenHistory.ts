"use server"

import prisma from "@/prisma/prisma"
import getServerIpAddress from "../System/GetIpAddress"
import GetPort from "../System/GetPort"

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

  const serverIPAddress = await getServerIpAddress()
  const port = await GetPort()

  const listenHistorySongsPromises = listenHistorySongIds.map(async (songId) => {
    const songRequest = await fetch(`http://${serverIPAddress}:${port}/server/song/info/${songId}`)
    return songRequest.json()
  })

  let listenHistorySongs = await Promise.all(listenHistorySongsPromises)

  if (unique) {
    const uniqueSongs = new Map(listenHistorySongs.map(song => [song.id, song]))
    listenHistorySongs = Array.from(uniqueSongs.values())
  }

  return listenHistorySongs
}