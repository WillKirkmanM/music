import Link from "next/link";
import ClientAuth from "../Authentication/ClientAuth";

export default function NavBar() {
  return (
    <nav className="fixed w-full top-0 p-4 flex items-center justify-between">
      <Link href="/">
        <div className="text-2xl text-white font-bold hover:text-gray-300">
          ParsonLabs Music
        </div>
      </Link>

      <ClientAuth />
    </nav>
  )
}