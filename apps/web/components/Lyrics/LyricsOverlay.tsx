"use client"

import { LyricsContext } from "./LyricsOverlayContext"
import { useState, useEffect, useContext, useRef } from 'react';
import { usePlayer } from "../Music/Player/usePlayer";

type QueuePanelProps = {
  children: React.ReactNode
}

export interface LyricsObjectResponse {
  id: number
  name: string
  trackName: string
  artistName: string
  albumName: string
  duration: number
  instrumental: boolean
  plainLyrics: string
  syncedLyrics?: string
}

const parseLyrics = (lyrics: string) => {
  return lyrics.split('\n').map(line => {
    const time = line.substring(line.indexOf('[') + 1, line.indexOf(']'));
    const text = line.substring(line.indexOf(']') + 1).trim();
    let minutes = 0, seconds = 0, hundredths = 0;

    if (time.includes(':')) {
      const timeParts = time.split(':');
      minutes = parseFloat(timeParts[0] ?? '0');
      if (timeParts[1]?.includes('.')) {
        const secondParts = timeParts[1].split('.');
        seconds = parseFloat(secondParts[0] ?? '0');
        hundredths = parseFloat(secondParts[1] ?? '0');
      } else {
        seconds = parseFloat(timeParts[1] ?? '0');
      }
    }

    const timeInSeconds = minutes * 60 + seconds + hundredths / 100;
    return { time: timeInSeconds, text };
  });
};

export default function LyricsOverlay({ children }: QueuePanelProps) {
  const { areLyricsVisible, setLyricsVisible } = useContext(LyricsContext);
  const { song, currentTime, handleTimeChange } = usePlayer()
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const [isSyncedLyrics, setIsSyncedLyrics] = useState(false)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const lyricsRef = useRef<HTMLDivElement>(null)
  const [scrollTimeoutID, setScrollTimeoutID] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isUserScrolling && lyricsRef.current) {
      const currentLyricElement = lyricsRef.current.children[currentLyricIndex] as HTMLParagraphElement;
      currentLyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentLyricIndex, isUserScrolling]);

  function handleScroll() {
    setIsUserScrolling(true);
    if (scrollTimeoutID) {
      clearTimeout(scrollTimeoutID);
    }
    setScrollTimeoutID(setTimeout(() => setIsUserScrolling(false), 100));
  }

  useEffect(() => {
    return () => {
      if (scrollTimeoutID) {
        clearTimeout(scrollTimeoutID);
      }
    };
  }, [scrollTimeoutID]);
  

useEffect(() => {
  setLyrics([])
  setCurrentLyric("")
  setCurrentLyricIndex(-1)
  setIsUserScrolling(false)
  setIsSyncedLyrics(false)

  const fetchLyrics = async () => {
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${song.name} ${song.artist}`)}`);
    const data: LyricsObjectResponse[] = await response.json();
    if (data[0]?.syncedLyrics) {
      setLyrics(parseLyrics(data[0].syncedLyrics));
      setIsSyncedLyrics(true)
    } else if (data[0]?.plainLyrics) {
      setLyrics(parseLyrics(data[0].plainLyrics));
      setIsSyncedLyrics(false)
    }
  }

  fetchLyrics();
}, [song]);

  useEffect(() => {
    let animationFrameId: number;

    const updateLyric = () => {
      const currentSongTime = currentTime; 
      const lineIndex = lyrics.findIndex((line, i) => {
        return currentSongTime >= line.time && (i + 1 === lyrics.length || currentSongTime < (lyrics[i + 1]?.time ?? 0));
      });

      if (lineIndex !== -1 && lyrics[lineIndex]?.text.length !== 0) {
        setCurrentLyric(lyrics[lineIndex]!.text);
        setCurrentLyricIndex(lineIndex)
      }

      animationFrameId = requestAnimationFrame(updateLyric);
    };

    updateLyric();

    return () => cancelAnimationFrame(animationFrameId);
  }, [lyrics, currentTime]);

  return areLyricsVisible ? (
    <div onScroll={handleScroll} ref={lyricsRef} className="mb-32">
      <p className="text-center">{song.name} Lyrics</p>
      {lyrics.map((line, index) => (
        <p 
          key={index} 
          className={`text-3xl text-center transition-opacity duration-2000 ${index === currentLyricIndex ? 'opacity-100' : 'opacity-50'} ${index === currentLyricIndex ? 'font-bold' : 'font-normal'} ${isSyncedLyrics ? 'cursor-pointer' : ''}`} 
          onClick={isSyncedLyrics ? () => handleTimeChange(line.time) : undefined}
        >
          {line.text}
        </p>
      ))}
    </div>
  ) : children;
}