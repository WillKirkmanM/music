import prisma from "@/prisma/prisma";
import { User } from "@prisma/client";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@music/ui/components/avatar";
import FollowButton from "@/components/Friends/FollowButton";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";

type UsernamePageParams = {
  params: {
    username: string;
  };
};

export default async function UsernamePage({ params }: UsernamePageParams) {
  const loggedInUserObject = await getServerSession();
  const loggedInUsername = loggedInUserObject!.user.username;

  let loggedInUser = await prisma.user.findFirst({
    where: {
      username: loggedInUsername,
    },
  });

  let user: User | null = await prisma.user.findFirst({
    where: {
      username: params.username,
    },
  });

  if (!user || !loggedInUser) redirect("/404");

  return (
    <div className="flex items-center justify-center h-screen">
      {user ? (
        <div className="text-center">
          {user.image ? (
            <Image src={user.image} alt="" />
          ) : (
            <Avatar>
              <AvatarFallback>
                {user.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          <p className="text-lg">{user.name}</p>
          <p>@{user.username}</p>
          {user.username === loggedInUsername ? (
            <p>This is your profile</p>
          ) : (
            <FollowButton loggedInUser={loggedInUser} userToFollow={user} />
          )}
        </div>
      ) : (
        redirect("/404")
      )}
    </div>
  );
}
