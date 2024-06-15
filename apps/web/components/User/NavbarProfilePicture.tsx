import {
  LogOut,
  Settings,
  User,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@music/ui/components/dropdown-menu"

import {
  Dialog,
  DialogTrigger,
} from "@music/ui/components/dialog"
 
import { Avatar, AvatarFallback, AvatarImage } from "@music/ui/components/avatar"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import SettingsDialog from "./SettingsDialog"

export default function NavbarProfilePicture() {
  const session = useSession()
  const username = session?.data?.user.username

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="mr-4 cursor-pointer">
            <AvatarImage src="" alt="usr" className="bg-gray-600"/>
            <AvatarFallback>{username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={`/profile/${username}`}>
              <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
              </DropdownMenuItem>
            </Link>

            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DialogTrigger>

            </DropdownMenuGroup>

          <DropdownMenuSeparator/>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    <SettingsDialog />
    </Dialog>
  )
}