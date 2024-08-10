"use client"

import { Button } from "@music/ui/components/button";
import { HistoryIcon, Home } from "lucide-react";
import Link from "next/link";
import { ReactNode, useContext } from "react";
import { LyricsContext } from "../Lyrics/LyricsOverlayContext";
import { ScrollContext } from "../Providers/ScrollProvider";
import { useSidebar } from "../Providers/SideBarProvider";

type SidebarProps = {
  children: ReactNode,
  sidebarContent: ReactNode
}


export default function Sidebar({ children, sidebarContent }: SidebarProps) {
  const { isOpen } = useSidebar()
  const { onTopOfPage } = useContext(ScrollContext)
  const { areLyricsVisible } = useContext(LyricsContext)

  return (
    <div className="flex">
      <aside className={`hidden md:block z-40 fixed h-full ${onTopOfPage || areLyricsVisible ? "" : "border-r border-gray-500"} ${isOpen ? "w-1/5 xl:w-[18%]" : "w-3 xl:w-20"} space-y-2 p-4 lg:block pt-20`}>
        <Button variant="ghost" asChild size={isOpen ? "default" : "icon"} className={`${!isOpen && "items-center justify-center"} w-full flex items-start justify-start`}>
          <Link href="/home">
            <div className={`flex ${isOpen ? "flex-row" : "flex-col"} items-center text-white text-semibold `}>
              <Home className={`h-4 w-4 ${isOpen && "mr-4"}`} /> Home
            </div>
          </Link>
        </Button>
        <Button variant="ghost" asChild size={isOpen ? "default" : "icon"} className={`${!isOpen && "items-center justify-center"} w-full flex items-start justify-start`}>
          <Link href="/history">
            <div className={`flex ${isOpen ? "flex-row" : "flex-col"} items-center text-white text-semibold `}>
              <HistoryIcon className={`h-4 w-4 ${isOpen && "mr-4"}`} /> History
            </div>
          </Link>
        </Button>
        {isOpen && sidebarContent}
      </aside>

      <div className={`overflow-x-auto flex-grow ${isOpen ? "ml-[20%] md:ml-[19%]" : "ml-[5%] md:ml-28 mt-5"}`}>
        {children}
      </div>
    </div>
  )
};