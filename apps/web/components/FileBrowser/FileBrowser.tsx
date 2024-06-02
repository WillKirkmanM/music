"use client"

import List from "@/actions/Filesystem/List"
import { Button } from "@music/ui/components/button";
import { ScrollArea } from "@music/ui/components/scroll-area";
import { useState, useEffect, startTransition } from "react"
import IndexLibrary from "@/actions/Library/Index";

interface Directory {
  name: string;
  path: string;
}

export default function FileBrowser() {

  const [currentDirectory, setCurrentDirectory] = useState("/")
  const [currentDirectoryList, setCurrentDirectoryList] = useState<Directory[]>([])

  async function updateList(directoryPath: string) {
    const directoryList = await List(directoryPath)
    setCurrentDirectory(directoryPath)
    setCurrentDirectoryList(directoryList)
  }

  function getParentDirectory(currentDirectory: string): string {
    const separator = currentDirectory.includes("\\") ? "\\" : "/";
    const parentDirectory = currentDirectory.split(separator).slice(0, -1).join(separator) || separator;
    return parentDirectory
  }

  function goBack() {
    const parentDirectory = getParentDirectory(currentDirectory)
    updateList(parentDirectory);
  }

  useEffect(() => {
    updateList("/")
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <p>Current Directory: {currentDirectory}</p>
      <div className="flex flex-col items-stretch border h-80 w-1/2">
        <p className="cursor-pointer" onClick={goBack} title={getParentDirectory(currentDirectory)}>...</p>

        <ScrollArea>
          {currentDirectoryList.map(directory => (
            <p key={directory.path} className="cursor-pointer" title={directory.path} onClick={() => updateList(directory.path)}>{directory.name}</p>
          ))}
        </ScrollArea>
      </div>

      <Button onClick={() => startTransition(() => IndexLibrary(currentDirectory))}>Index Library</Button>
    </div>
  )
}