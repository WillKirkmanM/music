"use client"

import { Button } from "@music/ui/components/button";
import Link from "next/link";
import { Home } from "lucide-react";
import { useSidebar } from "../Providers/SideBarProvider";
import { ReactNode, useContext } from "react";
import { ScrollContext } from "../Providers/ScrollProvider";

type SidebarProps = {
  children: ReactNode,
  sidebarContent: ReactNode
}


export default function Sidebar({ children, sidebarContent }: SidebarProps) {
  const { isOpen } = useSidebar()
  const { onTopOfPage } = useContext(ScrollContext)

  return (
    <div className="flex">

      <aside className={`hidden md:block z-40 fixed h-full ${onTopOfPage ? "" : "border-r border-gray-500"} ${isOpen ? "w-1/5 xl:w-[18%]" : "w-3 xl:w-20"} space-y-2 p-4 lg:block pt-20`}>
        <Button variant="ghost" asChild size={isOpen ? "default" : "icon"} className={`${!isOpen && "items-center justify-center"} w-full flex items-start justify-start`}>
          <Link href="/">
            <div className={`flex ${isOpen ? "flex-row" : "flex-col"} items-center text-white text-semibold `}>
              <Home className={`h-4 w-4 ${isOpen && "mr-4"}`} /> Home
            </div>
          </Link>
        </Button>
        {isOpen && sidebarContent}
      </aside>

      <div className={`overflow-x-auto flex-grow ${isOpen ? "ml-[20%] md:ml-80" : "ml-[5%] md:ml-28 mt-5"}`}>
        {children}
      </div>
    </div>
  )
};