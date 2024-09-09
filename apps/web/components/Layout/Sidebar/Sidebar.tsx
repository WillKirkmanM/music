import Link from "next/link";

import pl from "@/assets/pl.png";
import { Button } from "@music/ui/components/button";
import { cn } from "@music/ui/lib/utils";
import Image from "next/image";
import { Menu } from "./Menu";
import { SidebarToggle } from "./SidebarToggle";
import { useSidebarToggle } from "./use-sidebar-toggle";

export default function Sidebar() {
  const { isOpen, setIsOpen } = useSidebarToggle();

  if (isOpen === undefined) return null;

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        isOpen === false ? "w-[90px]" : "w-72"
      )}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src={pl} alt="ParsonLabs Music Logo" className="w-6 h-6 mr-1 rounded-full"/>
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              ParsonLabs Music
            </h1>
          </Link>
        </Button>
        <Menu isOpen={isOpen} />
      </div>
    </aside>
  );
}