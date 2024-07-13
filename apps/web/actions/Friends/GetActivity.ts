"use server"

import prisma from "@/prisma/prisma";
import getServerIpAddress from "../System/GetIpAddress";
import GetPort from "../System/GetPort";

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

export default async function GetActivity(username: string) {
  let friends: Friend[] = [];
  let nowPlayingId;
    const userData = await prisma.user.findUnique({
      where: { username },
      include: { 
        followings: {
          include: { following: true }
        } 
      }
    });
    
    if (!friends || !userData) return

    for (const follow of userData!.followings) {

      const friend = follow.following;
      const friendNowPlayingId = friend.nowPlaying;
      let friendNowPlayingSong, friendNowPlayingAlbum, friendNowPlayingArtist;

      const serverIPAddress = await getServerIpAddress()
      const port = await GetPort()
      const songRequest = await fetch(`http://${serverIPAddress}:${port}/server/song/info/${friendNowPlayingId}`)
      const song = await songRequest.json()
      friendNowPlayingSong = song
      friendNowPlayingAlbum = song.album_object
      friendNowPlayingArtist = song.artist_object
         
    friends.push({
      ...friend,
      nowPlaying: {
        song: friendNowPlayingSong,
        album: friendNowPlayingAlbum,
        artist: friendNowPlayingArtist
      }
    });
  }
  nowPlayingId = userData!.nowPlaying;

  return friends
}