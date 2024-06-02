"use server"

import getConfig from "../Config/getConfig";
import prisma from "@/prisma/prisma";

export default async function GetActivity(username: string) {
  let friends = [];
  let nowPlayingId;
    const userData = await prisma.user.findUnique({
      where: { username },
      include: { 
        followings: {
          include: { following: true }
        } 
      }
    });
    
    const config = await getConfig()
    const library = JSON.parse(config ?? "")
    
    for (const follow of userData!.followings) {
      const friend = follow.following;
      const friendNowPlayingId = friend.nowPlaying;
      let friendNowPlayingSong, friendNowPlayingAlbum, friendNowPlayingArtist;
      
      for (const artist of library) {
        for (const album of artist.albums) {
          for (const song of album.songs) {
            if (String(song.id) === friendNowPlayingId) {
              friendNowPlayingSong = song;
              friendNowPlayingAlbum = album;
              friendNowPlayingArtist = artist;
              break;
            }
          }
          if (friendNowPlayingSong) break;
      }
      if (friendNowPlayingSong) break;
    }
    
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