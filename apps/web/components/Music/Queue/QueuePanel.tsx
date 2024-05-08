"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@music/ui/components/resizable"
import { useContext, useState, useEffect } from "react"
import Image from "next/image"
import { PanelContext } from "./QueuePanelContext"
import { usePlayer } from "../Player/usePlayer"
import imageToBase64 from "@/actions/ImageToBase64"
import Artist from "@/types/Music/Artist"
import Song from "@/types/Music/Song"
import Album from "@/types/Music/Album"
import Link from "next/link"

type QueuePanelProps = {
  children: React.ReactNode
}

function ChildrenComponent({ children }: QueuePanelProps) {
  return (
    <ResizablePanel defaultSize={100} className="!overflow-y-auto">{children}</ResizablePanel>
  )
}

export default function QueuePanel({ children }: QueuePanelProps) {
  const { isPanelVisible } = useContext(PanelContext);

  const { queue } = usePlayer()

  return (
    <ResizablePanelGroup direction={"horizontal"}>
      <ChildrenComponent>{children}</ChildrenComponent>
      {isPanelVisible && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
            {queue && queue.map(queueItem => {
              return (
                <QueueItem queueItem={queueItem} key={queueItem.song.id}/>
              ); 
            })}
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

type Queue = {
  queueItem: {
    song: Song
    artist: Artist,
    album: Album
  }
}

function QueueItem({ queueItem }: Queue) {
  const [imageSrc, setImageSrc] = useState("")

  useEffect(() => {
    const handlePlay = async (coverURL: string) => {
      let base64Image = coverURL
      if (coverURL.length > 0) {
        base64Image = await imageToBase64(coverURL)
      }

      setImageSrc(`data:image/jpg;base64,${base64Image}`)
    }

    handlePlay(queueItem.album.cover_url)
  }, [queueItem.album.cover_url])

  const { song, artist, album } = queueItem

  return (
    <div className="flex items-center">
      <Image src={imageSrc} width={64} height={64} alt={song.name + " Image"}/>
      <div className="ml-4">
        <Link href={`/album/${album.id}`}><p>{song.name}</p></Link>
        <Link href={`/artist/${artist.id}`}><p>{artist.name}</p></Link>
        <Link href={`/album/${artist.id}`}><p>{album.name}</p></Link>
      </div>
    </div>
  )
}