"use client"

import { createContext, useState } from 'react';

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

  const toggleLyrics = () => {
    setLyricsVisible(prev => !prev);
  };

  return (
    <LyricsContext.Provider value={{ areLyricsVisible, toggleLyrics, setLyricsVisible }}>
      {children}
    </LyricsContext.Provider>
  );
};