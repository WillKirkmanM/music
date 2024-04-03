import { useState, useRef, useEffect, useCallback } from "react";

export function usePlayer(audioSource: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [onLoop, setOnLoop] = useState(false);
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio(audioSource);
  }, [audioSource]);

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

  function stepForward() {
    let audio = audioRef.current || new Audio()
    setTimeout(() => {
      audio.currentTime += 1
    }, 200)
  }
  function stepBack() {
    let audio = audioRef.current || new Audio()
    setTimeout(() => {
      audio.currentTime -= 1
    }, 200)
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
        const handleKeyPress = (event: KeyboardEvent) => {
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
  }, [handleTimeUpdate, handleTimeUpdateThrottled, toggleLoopSong, toggleMute, togglePlayPause]);

  return {
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
  };
}