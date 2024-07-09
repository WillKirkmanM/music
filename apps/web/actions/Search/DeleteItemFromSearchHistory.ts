"use server"

import prisma from "@/prisma/prisma"

export default async function DeleteItemFromSearchHistory(username: string, searchId: string) {
  try {
	await prisma.user.update({
	  where: {
      username
	  },
	  data: {
      lastSearched: {
        delete: {
        id: searchId
        }
      }
	  }
	})
} catch (e) {
  console.log(e)
}
}