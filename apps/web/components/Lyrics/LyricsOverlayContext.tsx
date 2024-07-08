"use client"

import { createContext, useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export const LyricsContext = createContext({
  areLyricsVisible: false,
  setLyricsVisible: (visible: boolean) => {},
  toggleLyrics: () => {},
  currentLyrics: "",
  setCurrentLyrics: (lyrics: string) => {}
});

type PanelProviderProps = {
  children: React.ReactNode
}

function LyricsOverlayProvider({ children }: PanelProviderProps) {
  const [areLyricsVisible, setLyricsVisible] = useState(false);
  const [currentLyrics, setCurrentLyrics] = useState("");
  const pathName = usePathname()

  const toggleLyrics = () => {
    setLyricsVisible(prev => !prev);
  };

  return (
    <LyricsContext.Provider value={{ areLyricsVisible, toggleLyrics, setLyricsVisible, currentLyrics, setCurrentLyrics }}>
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsComponent setLyricsVisible={setLyricsVisible} pathName={pathName} />
      </Suspense>
      {children}
    </LyricsContext.Provider>
  );
};

type SearchParamsComponentType = {
  setLyricsVisible: Function;
  pathName: string
}

function SearchParamsComponent({ setLyricsVisible, pathName }: SearchParamsComponentType) {
  const searchParams = useSearchParams()

  useEffect(() => {
    setLyricsVisible(false)
  }, [pathName, searchParams, setLyricsVisible])

  return null;
}

export default LyricsOverlayProvider;