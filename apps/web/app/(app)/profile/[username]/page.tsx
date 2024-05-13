import prisma from "@/prisma/prisma"
import { User } from "@prisma/client"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@music/ui/components/avatar"

type UsernamePageParams = {
  params: {
    username: string
  }
}

export default async function UsernamePage({ params }: UsernamePageParams) {
  let user: User | null = await prisma.user.findFirst({
    where: {
      username: params.username,
    },
  });

  return (
    <div className="flex items-center justify-center h-screen">
      {user ? (
        <div className="text-center">
          {user.image ? (
            <Image src={user.image} alt=""/>
          ) : (
            <Avatar>
              <AvatarFallback>
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <p className="text-lg">{user.name}</p>
          <p>@{user.username}</p>
          
        </div>
      ) : (
        redirect("/404")
      )}
    </div>
);
}