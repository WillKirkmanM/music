"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { createContext } from "react";

import type Song from "@/types/Music/Song";
import Artist from "@/types/Music/Artist";
import Album from "@/types/Music/Album";
import imageToBase64 from "@/actions/ImageToBase64";

const isBrowser = typeof window !== "undefined";
const audioElement = isBrowser ? new Audio() : null;

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
  setArtist: Function;
  setAlbum: Function;
  setSongCallback: Function;
  setImageSrc: Function;
  setQueue: Function;
  addToQueue: Function;
  setBufferedTime: Function;
  bufferedTime: number;
  imageSrc: string;
  song: Song;
  artist: Artist;
  album: Album;
  queue: Queue[];
};

type Queue = {
  song: Song;
  album: Album;
  artist: Artist;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

interface PlayerProviderProps {
  children: React.ReactNode;
}

export function PlayerProvider({ children }: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(audioElement);
  const audio = audioRef.current as HTMLAudioElement;

  const [imageSrc, setImageSrc] = useState("");
  const [audioSource, setAudioSource] = useState("");
  const [song, setSong] = useState<Song>({
    artist: "",
    contributing_artists: [],
    name: "",
    path: "",
    track_number: 0,
    id: 0,
  });
  const [artist, setArtist] = useState<Artist>({ albums: [], id: 0, name: "" });
  const [album, setAlbum] = useState<Album>({
    cover_url: "",
    id: 0,
    name: "",
    songs: [],
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueueState] = useState<Queue[]>([]);

  const queueRef = useRef<Queue[]>([]);
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [onLoop, setOnLoop] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [base64Image, setBase64Image] = useState("")
  const [bufferedTime, setBufferedTime] = useState(0)
  
  const playAudioSource = useCallback(() => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = audioSource;
      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
      };
    }
  }, [audioSource, audio]);

  const setQueue = useCallback((newQueue: Queue[]) => {
    queueRef.current = newQueue;
    setQueueState(newQueue);
  }, []);

  const setSongCallback = useCallback(
    async (song: Song, artist: Artist, album: Album) => {
      setSong(song);
      setArtist(artist);
      setAlbum(album);
      if (album.cover_url.length === 0) {
        setBase64Image("/snf.png");
        setImageSrc("/snf.png");
      } else {
        imageToBase64(album.cover_url).then((base64) => {
          const base64Data = `data:image/jpg;base64,${base64}`;
          setBase64Image(base64Data);
          setImageSrc(base64Data);
        });
      }
      setAudioSource(`http://localhost:3001/stream/${encodeURIComponent(song.path)}`);

      const index = queueRef.current.findIndex((q) => q.song.id === song.id);
      if (index !== -1) {
        setCurrentSongIndex(index);
      }
    },
    [setSong]
  );

  const playNextSong = useCallback(() => {
    let nextSongIndex = currentSongIndex + 1;
    if (nextSongIndex >= queueRef.current.length) {
      nextSongIndex = 0;
    }
    setCurrentSongIndex(nextSongIndex);
    const next = queueRef.current[nextSongIndex];
    if (!next) {
      

    }
    if (next) {
      const nextSong = next!.song;
      const nextArtist = next!.artist;
      const nextAlbum = next!.album;
      
      if (nextSong) {
        setSongCallback(nextSong, nextArtist, nextAlbum);
        playAudioSource();
      }
    }
  }, [currentSongIndex, setSongCallback, playAudioSource]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioSource;
    }

    if (audio) {
      audio.src = audioSource;
      audio.load();
      audio.oncanplaythrough = () => {
        audio.play();
        setIsPlaying(true);
      };
      audio.addEventListener("ended", playNextSong);
    }

    return () => {
      audio.removeEventListener("ended", playNextSong);
    };
  }, [audioSource, audio, song, playNextSong]);

  const removeFromQueue = useCallback((index: number) => {
    const newQueue = [...queueRef.current];
    newQueue.splice(index, 1);
    queueRef.current = newQueue;
    setQueueState(newQueue);
  }, []);

  const addToQueue = useCallback((song: Song, album: Album, artist: Artist) => {
    const newQueue = [...queueRef.current, { song, album, artist }];
    queueRef.current = newQueue;
    setQueueState(newQueue);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current || new Audio();
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

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
      const buffer = audio.buffered
      if (buffer && buffer.length > 0) {
        setBufferedTime(buffer.end(buffer.length - 1))
      }
    }
  }, []);

  const handleTimeUpdateThrottled = useCallback(() => {
    setTimeout(() => {
      handleTimeUpdate();
    }, 1000);
  }, [handleTimeUpdate]);

  useEffect(() => {
    function stepForward() {
      setTimeout(() => {
        audio.currentTime += 1;
      }, 200);
    }
    function stepBack() {
      setTimeout(() => {
        audio.currentTime -= 1;
      }, 200);
    }

    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);

      const handleKeyPress = (event: KeyboardEvent) => {
        if ((event.target as HTMLElement).tagName.toLowerCase() === "input") {
          return;
        }
        switch (event.key.toLocaleLowerCase()) {
          case " ":
            togglePlayPause();
            break;
          case "m":
            toggleMute();
            break;
          case "l":
            toggleLoopSong();
            break;
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if ((event.target as HTMLElement).tagName.toLowerCase() === "input") {
          return;
        }
        switch (event.key.toLowerCase()) {
          case "arrowleft":
            stepBack();
            break;
          case "arrowright":
            stepForward();
            break;
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdateThrottled);
        document.removeEventListener("keydown", handleKeyPress);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [
    handleTimeUpdate,
    handleTimeUpdateThrottled,
    toggleLoopSong,
    toggleMute,
    togglePlayPause,
    audio,
  ]);

  return (
    <PlayerContext.Provider
      value={{
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
        setArtist,
        artist,
        setAlbum,
        album,
        setImageSrc,
        imageSrc,
        setSongCallback,
        addToQueue,
        bufferedTime,
        setBufferedTime,
        queue,
        setQueue,
      }}
    >
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
