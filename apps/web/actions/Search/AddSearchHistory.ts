"use server"

import prisma from "@/prisma/prisma"

export default async function AddSearchHistory(username: string, query: string) {
  if (!query) return

  await prisma.user.update({
    where: {
      username
    },
    data: {
      lastSearched: {
        create: {
          search: query
        }
      }
    }
  })
}