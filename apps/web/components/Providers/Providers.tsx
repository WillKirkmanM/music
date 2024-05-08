import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { PlayerProvider } from '../Music/Player/usePlayer';
import NextAuthSessionProvider from '@/lib/Authentication/Sessions/SessionProvider';
import PanelProvider from '../Music/Queue/QueuePanelContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider>
        <PlayerProvider>
          <PanelProvider>
            {children}
          </PanelProvider>
        </PlayerProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}