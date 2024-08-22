"use client"

import { Button } from "@music/ui/components/button";
import { HistoryIcon, Home } from "lucide-react";
import Link from "next/link";
import { ReactNode, useContext, useEffect, useState } from "react";
import { LyricsContext } from "../Lyrics/LyricsOverlayContext";
import { ScrollContext } from "../Providers/ScrollProvider";
import { useSidebar } from "../Providers/SideBarProvider";
import { usePathname } from "next/navigation";

type SidebarProps = {
  children: ReactNode,
  sidebarContent: ReactNode
}


export default function Sidebar({ children, sidebarContent }: SidebarProps) {
  const { isOpen } = useSidebar();
  const { onTopOfPage } = useContext(ScrollContext);
  const { areLyricsVisible } = useContext(LyricsContext);
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = useState<string | null>(null);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  if (currentPath === null) {
    return null;
  }

  return (
    <div className="flex">
      <aside className={`hidden md:block z-40 fixed h-full ${onTopOfPage || areLyricsVisible ? "" : "border-r border-gray-500"} ${isOpen ? "w-1/5 xl:w-[18%]" : "w-3 xl:w-20"} space-y-4 p-4 lg:block pt-20`}>
        <Button variant="ghost" asChild size={isOpen ? "default" : "icon"} className={`w-full flex items-center justify-start ${!isOpen && "h-12 w-12 flex-col items-center justify-center"}`}>
          <Link href="/home">
            <div className={`flex ${isOpen ? "flex-row" : "flex-col"} items-center text-white text-semibold`} style={{ mixBlendMode: 'difference', pointerEvents: 'none' }}>
              <Home className={`h-6 w-6 ${isOpen && "mr-4"}`} />
              {isOpen && <span className={`${!isOpen && "mt-2"}`}>Home</span>}
            </div>
          </Link>
        </Button>
        <Button variant="ghost" asChild size={isOpen ? "default" : "icon"} className={`w-full flex items-center justify-start ${!isOpen && "h-12 w-12 flex-col items-center justify-center"}`}>
          <Link href="/history">
            <div className={`flex ${isOpen ? "flex-row" : "flex-col"} items-center text-white text-semibold`} style={{ mixBlendMode: 'difference', pointerEvents: 'none' }}>
              <HistoryIcon className={`h-6 w-6 ${isOpen && "mr-4"}`} />
              {isOpen && <span className={`${!isOpen && "mt-2"}`}>History</span>}
            </div>
          </Link>
        </Button>
        {isOpen && sidebarContent}
      </aside>
  
      <div className={`overflow-x-auto flex-grow ${isOpen ? "ml-[20%] md:ml-[19%]" : "ml-[4%] md:ml-28 mt-5"}`}>
        {children}
      </div>
    </div>
  );
};