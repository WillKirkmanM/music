"use server"

import { User } from "@prisma/client";
import prisma from "@/prisma/prisma";

export default async function follow(loggedInUser: User, userToFollow: User) {
  await prisma.follow.create({
    data: {
      followerId: loggedInUser.id,
      followingId: userToFollow.id
    }
  })
}