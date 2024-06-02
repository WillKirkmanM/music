import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@music/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@music/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@music/ui/components/avatar"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export default function NavbarProfilePicture() {
  const session = useSession()
  const username = session?.data?.user.username

  return (
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

          <Link href="/settings">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </Link>

          </DropdownMenuGroup>

        <DropdownMenuSeparator/>
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}