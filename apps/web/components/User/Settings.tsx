import { User } from "@prisma/client"
import Username from "./Username"
import { ChangePassword } from "./ChangePassword"

type ProfileProps = {
  user: User
}

export default function Settings({ user }: ProfileProps) {
  return (
    <div className="flex flex-col items-center justify-center align-middle min-h-screen text-black">
      <Username username={user.username}/>
      <ChangePassword user={user}/>
    </div>
  )
}

