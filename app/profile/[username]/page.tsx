import Profile from "@/components/User/Settings"
import prisma from "@/prisma/prisma"
import { User } from "@prisma/client"
import { redirect } from "next/navigation"

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
    <>
      {user ? (
        <>
        <div>
          <h1>User Details</h1>
          {Object.entries(user as User).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {String(value)}
            </p>
          ))}
        </div>
        
        <Profile user={user} />
        </>
      ) : (
        redirect("/404")
      )}
    </>
  );
}