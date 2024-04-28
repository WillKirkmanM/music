"use client"

import { useState, useRef, useEffect, useCallback, useContext } from "react";
import { createContext } from "react";

import type Song from "@/types/Music/Song";

const isBrowser = typeof window !== "undefined"
const audioElement = isBrowser ? new Audio() : null

type PlayerContextType = {
  playAudioSource: Function;
  isPlaying: boolean;
  onLoop: boolean;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  togglePlayPause: Function;
  toggleLoopSong: Function;
  setAudioVolume: Function;
  handleTimeChange: Function;
  handleTimeUpdate: Function;
  toggleMute: Function;
  setAudioSource: Function;
  setSong: Function;
  setImageSrc: Function;
  imageSrc: string;
  song: Song
};

const PlayerContext = createContext<PlayerContextType | null>(null);

interface PlayerProviderProps {
  children: React.ReactNode,
}

export function PlayerProvider({ children }: PlayerProviderProps){
  const audioRef = useRef<HTMLAudioElement>(audioElement);
  const audio = audioRef.current as HTMLAudioElement

  const [imageSrc, setImageSrc] = useState("")
  const [audioSource, setAudioSource] = useState("")
  const [song, setSong] = useState<Song>({ artist: "", contributing_artists: [], name: "", path: "", track_number: 0, id: 0 })
  const [isPlaying, setIsPlaying] = useState(false);
  const [onLoop, setOnLoop] = useState(false);
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioSource
    }

    if (audio) {
      audio.src = audioSource;
      audio.load()
      audio.oncanplaythrough = () => {
        audio.play()
        setIsPlaying(true)
      }
    }

  }, [audioSource, audio, song]);
  
  const playAudioSource = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioSource;
      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [audioSource, audio]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current || new Audio()
    audio.muted = !muted
    setMuted(!muted)  
  }, [muted])

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleLoopSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.loop = !onLoop;
      setOnLoop(!onLoop);
    }
  }, [onLoop]);

  const setAudioVolume = useCallback((value: string) => {
    let volume = parseFloat(value) / 100;
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      setVolume(volume);
    }
  }, []);

  const handleTimeChange = useCallback((value: string) => {
    let newTime = parseFloat(value);
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    }
  }, []);

    const handleTimeUpdateThrottled = useCallback(() => {
      setTimeout(() => {
        handleTimeUpdate()
      }, 1000)
    }, [handleTimeUpdate])

    
    useEffect(() => {
      function stepForward() {
        setTimeout(() => {
          audio.currentTime += 1
        }, 200)
      }
      function stepBack() {
        setTimeout(() => {
          audio.currentTime -= 1
        }, 200)
      }

      if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
        
        const handleKeyPress = (event: KeyboardEvent) => {
          if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
            return;
          }
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
          
        const handleKeyUp = (event: KeyboardEvent) => {
          if ((event.target as HTMLElement).tagName.toLowerCase() === 'input') {
            return;
          }
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
        document.removeEventListener("keydown", handleKeyPress)
        document.removeEventListener("keyup", handleKeyUp)
      };
    }
  }, [handleTimeUpdate, handleTimeUpdateThrottled, toggleLoopSong, toggleMute, togglePlayPause, audio]);

    return (
    <PlayerContext.Provider value={{
      playAudioSource,
      isPlaying,
      onLoop,
      volume,
      muted,
      currentTime,
      duration,
      togglePlayPause,
      toggleLoopSong,
      setAudioVolume,
      handleTimeChange,
      handleTimeUpdate,
      toggleMute,
      setAudioSource,
      setSong,
      song,
      setImageSrc,
      imageSrc,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}