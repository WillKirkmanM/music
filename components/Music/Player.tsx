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

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [onLoop, setOnLoop] = useState(false)
  const [liked, setLiked] = useState(false)
  const [lineHovered, setLineHovered] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioSource = "/More Than a Woman.mp3"
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const toggleLoopSong = useCallback(() => {
    const audio = audioRef.current || new Audio()
    audio.loop = !onLoop 
    setOnLoop(!onLoop)
  }, [onLoop])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current || new Audio()
    audio.muted = !muted
    setMuted(!muted)  
  }, [muted])
  
  function setAudioVolume(value: string) {
    let volume = parseFloat(value) / 100

    let audio = audioRef.current || new Audio()
    audio.volume = volume

    setVolume(volume)
  }

  function handleTimeChange(value: string) {
    let newTime = parseFloat(value)

    let audio = audioRef.current || new Audio()
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }
  
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    setTimeout(() => {
      if (audio) {
        if (isPlaying) {
          audio.pause();
        } else {
          audio.play();
        }
        setIsPlaying(!isPlaying);
      };
    }, 100)
  }, [isPlaying])
  
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current || new Audio();
    setCurrentTime(audio.currentTime);
    setDuration(audio.duration);
  }, []);
  
  
  const handleTimeUpdateThrottled = useCallback(() => {
      setTimeout(() => {
        handleTimeUpdate()
      }, 1000)
    }, [handleTimeUpdate])
    
    useEffect(() => {
      const audio = audioRef.current || new Audio() ;
      
      audio.addEventListener('timeupdate', handleTimeUpdateThrottled);
      
      function stepForward() {
        let audio = audioRef.current || new Audio()
        console.log("CURRENT AUDIO", audio.currentTime)
        setTimeout(() => {
          audio.currentTime += 1
        }, 200)
      }
      function stepBack() {
        let audio = audioRef.current || new Audio()
        console.log("CURRENT AUDIO", audio.currentTime)
        setTimeout(() => {
          audio.currentTime -= 1
        }, 200)
      }

      function handleKeyPress(event: KeyboardEvent) {
        switch (event.key.toLocaleLowerCase()) {
          case " ":
            togglePlayPause()
            break
          case "m":
            toggleMute()
            break
          case "l":
            toggleLoopSong()
            break
          }
        }
        
        function handleKeyUp(event: KeyboardEvent) {
          switch (event.key.toLowerCase()) {
            case "arrowleft":
              stepBack()
              break
            case "arrowright":
              stepForward()
              break
          }
        }

      document.addEventListener("keydown", handleKeyPress)
      document.addEventListener("keyup", handleKeyUp)
        
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdateThrottled);
    };
  }, [handleTimeUpdateThrottled, togglePlayPause, currentTime, toggleLoopSong, toggleMute]);

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