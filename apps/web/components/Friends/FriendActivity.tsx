"use client"

import Link from "next/link";
import { useEffect, useState } from "react";
import GetActivity from "@/actions/Friends/GetActivity";
import { useSession } from "next-auth/react";

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
        setFriends(friends)
      }
    }
  
    getActivity()
  
    const intervalId = setInterval(getActivity, 5000)
  
    return () => {
      clearInterval(intervalId)
    }
  }, [username])

return friends && (
    <>
      {friends.length !== 0 && <h3 className="font-heading text-semibold text-white text-xl">Friend Activity</h3>}
      {friends.map((friend) => (
        <div key={friend.id}>
          <p className="text-sm">{friend.username}</p>
          {friend.nowPlaying && (
            <div className="pl-4">
              <Link href={`/album/${friend.nowPlaying.album.id}`}><p className="text-sm">{friend.nowPlaying.song.name}</p></Link>
              <div className="flex flex-row text-sm">
                <Link href={`/album/${friend.nowPlaying.album.id}`}><p>{friend.nowPlaying.album.name}</p></Link>
                <p className="px-1">•</p>
                <Link href={`/artist/${friend.nowPlaying.artist.id}`}><p>{friend.nowPlaying.artist.name}</p></Link>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  )
}