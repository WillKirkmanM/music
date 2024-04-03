"use client"

import Image from "next/image"

import { useState, useRef, useEffect, useCallback } from "react"
import IconPause from "../Icons/Pause"
import IconPlay from "../Icons/Play"
import PlusCircle from "../Icons/PlusCircle"
import CheckCircle from "../Icons/CheckCircle"
import { Slider } from "../ui/slider"
import ArrowPath from "../Icons/ArrowPath"
import SpeakerXMark from "../Icons/SpeakerXMark"
import SpeakerWave from "../Icons/SpeakerWave"
import { usePlayer } from "./usePlayer"

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [liked, setLiked] = useState(false)
  const [lineHovered, setLineHovered] = useState(false)

  const audioSource = "/More Than a Woman.mp3"
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
} = usePlayer(audioSource)

  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  


  return (
    <footer className="fixed bottom-0 bg-gray-600 border-t border-gray-700 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <section className="flex items-center gap-3">
        <div className="w-20 h-20 bg-gray-500 rounded-md">
          <Image alt="Return of the Mack Cover" src="https://m.media-amazon.com/images/I/71U4T6RxDBS._UF1000,1000_QL80_.jpg" width={334} height={332}/>
        </div>
          <div>
            <p className="whitespace-nowrap">Return of the Mack</p>
            <p className="text-xs text-gray-400">Mark Morrison</p>
          </div>
        <button className="text-gray-400 hover:text-white transition-colors duration-300">
          {liked ? <CheckCircle /> : <PlusCircle />}
        </button>
      </section>
      <section className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-4">
          <button>Shuffle</button>
          <button>Previous</button>
          <button onClick={togglePlayPause}>
            {isPlaying ? <IconPause /> : <IconPlay />}
          </button>
          <button>Next</button>
          <button onClick={toggleLoopSong}>
            {onLoop ? <ArrowPath style={{ strokeWidth: 2, color: 'white' }} /> : <ArrowPath />}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <input 
              type="range" 
              className="h-1 w-1/2 slider" 
              min={0} 
              max={duration} 
              value={currentTime} 
              onChange={e => handleTimeChange(e.target.value)}
              onMouseEnter={() => setLineHovered(true)}
              onMouseLeave={() => setLineHovered(false)}
            />
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
      </section>
      <section className="flex items-center gap-2 w-1/3">
        <button>List</button>
        <button>Devices</button>
        <div className="flex items-center gap-1 flex-grow">
          <button onClick={toggleMute}>
            {muted ? <SpeakerXMark /> : <SpeakerWave />}
          </button>
          <input type="range" className="h-0.1 w-full" value={volume * 100} min={0} max={100} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAudioVolume(e.target.value)} />
        </div>
        <button>Fullscreen</button>
      </section>
      <audio ref={audioRef} src={audioSource} onTimeUpdate={handleTimeUpdate}/>
    </footer>
  )
}