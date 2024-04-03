import Settings from "@/components/User/Settings";
import getServerSession from "@/lib/Authentication/Sessions/GetServerSession";
import prisma from "@/prisma/prisma";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerSession()
  
  if (!session) redirect("/login")
  console.log(session.user.username)

  const user = await prisma.user.findFirst({
    where: {
      username: session.user.username,
    }
  }) 

  if (!user) throw new Error("User not found");

  return (
    <Settings user={user}/>
  )
}