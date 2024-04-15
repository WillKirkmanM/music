import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";

export default function ProfilePageWithoutUsername() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <p className="text-lg text-center">Profile was not found! Maybe try a profile like</p>

        <div className="flex flex-row items-center space-x-3">
          <Avatar className="text-black">
            <AvatarFallback>
              TB
            </AvatarFallback>
          </Avatar>
          <Link href="/profile/tonybraxton">
            <p className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              profile/tonybraxton
            </p>
          </Link>
        </div>
    </div>
  )
}