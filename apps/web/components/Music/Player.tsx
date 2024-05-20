"use client";

import Image from "next/image";

import { useState, useRef, useContext } from "react";
import { PanelContext } from "./Queue/QueuePanelContext";
import IconPause from "../Icons/Pause";
import IconPlay from "../Icons/Play";
import PlusCircle from "../Icons/PlusCircle";
import CheckCircle from "../Icons/CheckCircle";
import ArrowPath from "../Icons/ArrowPath";
import SpeakerXMark from "../Icons/SpeakerXMark";
import SpeakerWave from "../Icons/SpeakerWave";
import { MicVocal } from "lucide-react";
import IconQueue from "../Icons/IconQueue";
import { usePlayer } from "./Player/usePlayer";
import AddToPlaylistDropdown from "./Player/AddToPlaylistDropdown";
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from "@music/ui/components/slider";
import Link from "next/link";
import { LyricsContext } from "../Lyrics/LyricsOverlayContext";

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [liked, setLiked] = useState(false);

  const { togglePanel } = useContext(PanelContext);
  const { toggleLyrics } = useContext(LyricsContext);

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
    song,
    bufferedTime,
    artist,
    album,
  } = usePlayer();

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <footer className="fixed bottom-0 bg-gray-600 border-t border-gray-700 px-3 py-3 flex flex-col md:flex-row items-center justify-between md:gap-4 w-full">
      <section className="flex flex-col md:flex-row items-center justify-between gap-3 w-full md:w-1/4">
        <div className="flex items-center w-full md:w-1/2 justify-center">
          <Slider
            min={0}
            max={duration}
            value={[currentTime]}
            onValueChange={([values]) => {
              handleTimeChange(Number(values));
            }}
            className="w-full group"
          >
            <SliderTrack className="h-1 bg-gray-400 cursor-pointer">
              <SliderRange
                className="bg-gray-500"
                style={{ width: `${(bufferedTime / duration) * 100}%` }}
              />
              <SliderRange className="bg-black" />
            </SliderTrack>
            <SliderThumb className="cursor-pointer bg-white hidden group-hover:block size-4" />
          </Slider>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-gray-400">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-20 md:h-20 bg-gray-500 rounded-md">
              <Image
                alt={song.name + "Image"}
                src={imageSrc}
                width={334}
                height={332}
              />
            </div>
            <div className="w-32 md:overflow-hidden">
              <p
                className={`whitespace-nowrap ${song.name.length > 15 ? "md:animate-marquee" : ""}`}
                title={song.name.length > 15 ? song.name : ""}
              >
                <Link href={`/album/${album.id}`}>{song.name}</Link>
              </p>
              <p className="text-xs text-gray-400">
                <Link href={`/artist/${artist.id}`}>{artist.name}</Link>
              </p>
            </div>
          </div>
          <div className="text-gray-400 hover:text-white transition-colors duration-300 md:hidden">
            <button onClick={() => togglePlayPause()}>
              {isPlaying ? <IconPause /> : <IconPlay />}
            </button>
          </div>
        </div>
      </section>
      <section className="hidden md:flex items-center gap-2">
        <button>List</button>
        <button>Devices</button>
        <button onClick={toggleLyrics}>
          <MicVocal />
        </button>
        <button onClick={togglePanel}>
          <IconQueue />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => toggleMute()}>
            {muted || !volume ? <SpeakerXMark /> : <SpeakerWave />}
          </button>
          <Slider
            min={0}
            max={100}
            value={[volume * 100]}
            onValueChange={([values]: number[]) => {
              setAudioVolume(Number(values));
            }}
            className="group"
          >
            <SliderTrack className="h-1 w-20 bg-gray-400 cursor-pointer">
              <SliderRange className="bg-black" />
            </SliderTrack>
            <SliderThumb className="cursor-pointer bg-white hidden group-hover:block size-4" />
          </Slider>
        </div>
        <button>Fullscreen</button>
      </section>
      <audio ref={audioRef} onTimeUpdate={() => handleTimeUpdate} />
    </footer>
  );
}
