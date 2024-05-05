"use client"

import Image from "next/image"

import { useState, useRef, useEffect } from "react"
import IconPause from "../Icons/Pause"
import IconPlay from "../Icons/Play"
import PlusCircle from "../Icons/PlusCircle"
import CheckCircle from "../Icons/CheckCircle"
import ArrowPath from "../Icons/ArrowPath"
import SpeakerXMark from "../Icons/SpeakerXMark"
import SpeakerWave from "../Icons/SpeakerWave"
import { usePlayer } from "./Player/usePlayer"
import AddToPlaylistDropdown from "./Player/AddToPlaylistDropdown"
import { SessionProvider } from "next-auth/react"
import { Slider, SliderRange, SliderThumb, SliderTrack } from "@music/ui/components/slider"

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [liked, setLiked] = useState(false)

  const {
    isPlaying,
    onLoop,
    volume,
    currentTime,
    duration,
    togglePlayPause,
    toggleLoopSong,
    muted,
    setAudioVolume,
    handleTimeChange,
    handleTimeUpdate,
    toggleMute,
    imageSrc,
    song
  } = usePlayer()

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <footer className="fixed bottom-0 bg-gray-600 border-t border-gray-700 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <section className="flex items-center gap-3">
        <div className="w-20 h-20 bg-gray-500 rounded-md">
          <Image alt={song.name + "Image"} src={imageSrc} width={334} height={332} />
        </div>
        <div className="w-32 overflow-hidden">
          <p className={`whitespace-nowrap ${song.name.length > 15 ? 'animate-marquee' : ''}`} title={song.name.length > 15 ? song.name : ''}>{song.name}</p>
          <p className="text-xs text-gray-400">{song.artist}</p>
        </div>
        <div className="text-gray-400 hover:text-white transition-colors duration-300">
          {song.name && (liked ? <CheckCircle /> : <SessionProvider><AddToPlaylistDropdown><PlusCircle /></AddToPlaylistDropdown></SessionProvider>)}
        </div>
      </section>
      <section className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-4">
          <button>Shuffle</button>
          <button>Previous</button>
          <button onClick={() => togglePlayPause()}>
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button>Next</button>
          <button onClick={() => toggleLoopSong}>
            {onLoop ? <ArrowPath style={{ strokeWidth: 2, color: 'white' }} /> : <ArrowPath />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            {/* <input 
              type="range" 
              className="h-1 w-1/2 slider" 
              min={0} 
              max={duration} 
              value={currentTime} 
              onChange={e => handleTimeChange(e.target.value)}
            /> */}

          <Slider
            min={0}
            max={duration}
            value={[currentTime]}
            onValueChange={([values]) => {
              handleTimeChange(Number(values))
            }}
            className="w-1/2 group"
          >
            <SliderTrack className="h-1 bg-gray-400 cursor-pointer">
              <SliderRange />
            </SliderTrack>

            <SliderThumb className="cursor-pointer bg-white hidden group-hover:block size-4" />
          </Slider>

            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
      </section>
      <section className="flex items-center gap-2 w-1/3">
        <button>List</button>
        <button>Devices</button>
        <div className="flex items-center gap-1 flex-grow">
          <button onClick={() => toggleMute()}>
            {muted || !volume ? <SpeakerXMark /> : <SpeakerWave />}
          </button>
          <input type="range" className="h-0.1 w-full" value={volume * 100} min={0} max={100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudioVolume(e.target.value)} />
        </div>
        <button>Fullscreen</button>
      </section>
      <audio ref={audioRef} onTimeUpdate={() => handleTimeUpdate}/>
    </footer>
  )
}