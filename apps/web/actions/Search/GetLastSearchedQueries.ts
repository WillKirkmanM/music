"use server"

import prisma from "@/prisma/prisma";

export default async function GetLastSearchedQueries(username: string) {
  const userWithSearchHistory = await prisma.user.findUnique({
    where: {
      username
    },
    select: {
      lastSearched: {
        take: 10,
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });
  
  return userWithSearchHistory?.lastSearched ?? [];
}