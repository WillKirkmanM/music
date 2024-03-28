import { getServerSession as getServerSessionNextAuth } from "next-auth/next"
import { authOptions } from "@/lib/Authentication/AuthOptions"

export default async function getServerSession() {
  const session = await getServerSessionNextAuth(authOptions)
  return session
}