"use client"

import { createContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'

export const LyricsContext = createContext({
  areLyricsVisible: false,
  setLyricsVisible: (visible: boolean) => {},
  toggleLyrics: () => {},
});

type PanelProviderProps = {
  children: React.ReactNode
}

export default function LyricsOverlayProvider({ children }: PanelProviderProps) {
  const [areLyricsVisible, setLyricsVisible] = useState(false);

  const pathname = usePathname()
  const searchParams = useSearchParams()
 
  useEffect(() => {
    setLyricsVisible(false)
  }, [pathname, searchParams])

  const toggleLyrics = () => {
    setLyricsVisible(prev => !prev);
  };

  return (
    <LyricsContext.Provider value={{ areLyricsVisible, toggleLyrics, setLyricsVisible }}>
      {children}
    </LyricsContext.Provider>
  );
};