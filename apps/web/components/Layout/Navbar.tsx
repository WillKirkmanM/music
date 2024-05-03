import Link from "next/link";
import ClientAuth from "../Authentication/ClientAuth";
import SearchBar from "../Search/SearchBar";
import ToggleTheme from "../Themes/ToggleTheme";

export default function NavBar() {
  return (
    <>
      <nav className="fixed w-full top-0 p-4 flex items-center justify-between gap-2 border-b border-gray-300">
        <Link href="/">
          <div className="text-2xl text-white font-bold hover:text-gray-300">
            ParsonLabs Music
          </div>
        </Link>

        <SearchBar />

        <div className="flex gap-3">
          <ClientAuth />
          <ToggleTheme />
        </div>
      </nav>
    </> 
  )
}