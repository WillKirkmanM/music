import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { PlayerProvider } from '../Music/Player/usePlayer';
import NextAuthSessionProvider from '@/lib/Authentication/Sessions/SessionProvider';
import PanelProvider from '../Music/Queue/QueuePanelContext';
import LyricsOverlayProvider from '../Lyrics/LyricsOverlayContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider>
        <PlayerProvider>
          <PanelProvider>
            <LyricsOverlayProvider>
              {children}
            </LyricsOverlayProvider>
          </PanelProvider>
        </PlayerProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}