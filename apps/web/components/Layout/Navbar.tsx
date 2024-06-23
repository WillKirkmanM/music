"use client"

import { Suspense, useContext, useState } from 'react';
import Link from "next/link";
import SearchBar from "../Search/SearchBar";
import { ScrollContext } from '../Providers/ScrollProvider';
import { useSidebar } from '../Providers/SideBarProvider';
import { Button } from '@music/ui/components/button';
import { Menu } from 'lucide-react';
import { useGradientHover } from '../Providers/GradientHoverProvider';
import NavbarProfilePicture from '../User/NavbarProfilePicture';

export default function NavBar() {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { onTopOfPage } = useContext(ScrollContext)
  const { toggleSidebar } = useSidebar()
  const { gradient } = useGradientHover()

  return (
    <nav className={`fixed w-full top-0 p-4 flex items-center justify-between gap-2 box-border h-16 transition-colors duration-200 ${onTopOfPage ? "bg-transparent" : "bg-black border-b border-gray-500"}  ${isSearchActive && 'items-stretch'}`}>
    <div className={`${isSearchActive ? 'hidden' : 'flex'} md:flex items-center`}>
      <Button onClick={toggleSidebar} variant="ghost" className="pr-4">
        <Menu />
      </Button>
      <Link href="/">
        <div className="md:text-2xl text-white font-bold hover:text-gray-300">
          ParsonLabs Music
        </div>
      </Link>
    </div>

      <SearchBar isSearchActive={isSearchActive} setIsSearchActive={setIsSearchActive} />

      <div className={`${isSearchActive ? 'hidden' : 'flex'} gap-3 md:flex ${onTopOfPage && "opacity-35"}`}>
        <NavbarProfilePicture />
      </div>
    </nav>
  );
}