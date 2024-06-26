"use server"

import prisma from "@/prisma/prisma"

export default async function AddSongToHistory(username: string, songID: string) {
  const user = await prisma.user.findUnique({
    where: {
      username
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.listenHistoryItem.create({
    data: {
      userId: user.id,
      songId: songID,
    }
  });
}