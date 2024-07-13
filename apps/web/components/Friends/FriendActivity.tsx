"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import GetActivity from "@/actions/Friends/GetActivity";
import { useSession } from "next-auth/react";
import { Disc3Icon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@music/ui/components/avatar";

type Friend = {
  nowPlaying: {
    song: any;
    album: any;
    artist: any;
  };
  id: string;
  name: string | null;
  username: string;
  password: string;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function FriendActivity() {
  const [friends, setFriends] = useState<Friend[]>([])

  const session = useSession()
  const username = session?.data?.user.username

  useEffect(() => {
    async function getActivity() {
      if (username) {
        const friends = await GetActivity(username)
        setFriends(friends || [])
      }
    }
  
    getActivity()
  
    const intervalId = setInterval(getActivity, 5000)
  
    return () => {
      clearInterval(intervalId)
    }
  }, [username])

  
  return friends &&  (
    <>
      {friends.length !== 0 && <h3 className="font-heading text-white font-semibold text-xl">Friend Activity</h3>}
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center">
          <Avatar className="cursor-pointer">
            <AvatarImage src="" alt="usr" className="bg-gray-600"/>
            <AvatarFallback>{friend.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <p className="text-sm">{friend.username}</p>
            {friend.nowPlaying && friend.nowPlaying.album &&
              <>
                <Link href={`/album/${friend.nowPlaying.album.id}`}><p className="text-sm">{friend.nowPlaying.song.name}</p></Link>
                {friend.nowPlaying.artist && <Link href={`/artist/${friend.nowPlaying.artist.id}`}><p className="text-sm">{friend.nowPlaying.artist.name}</p></Link>}
                <div className="flex flex-row items-center text-base">
                  <Disc3Icon className="mr-1" size={16} />
                  <Link href={`/album/${friend.nowPlaying.album.id}`}><p className="truncate">{friend.nowPlaying.album.name}</p></Link>
                </div>
              </>
            }
          </div>
        </div>
      ))}
    </>
  )
}