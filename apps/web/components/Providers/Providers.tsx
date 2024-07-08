import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { PlayerProvider } from '../Music/Player/usePlayer';
import NextAuthSessionProvider from '@/lib/Authentication/Sessions/SessionProvider';
import PanelProvider from '../Music/Queue/QueuePanelContext';
import LyricsOverlayProvider from '../Lyrics/LyricsOverlayContext';
import RestrictedAppProvider from '@/lib/Authentication/Sessions/RestrictedAppProvider';
import { ScrollProvider } from './ScrollProvider';
import SidebarProvider from './SideBarProvider';
import { GradientHoverProvider } from './GradientHoverProvider';
import AIOverlayProvider from '../AI/AIOverlayContext';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider>
        <RestrictedAppProvider>
          <GradientHoverProvider>
            <ScrollProvider>
              <SidebarProvider>
                <PlayerProvider>
                  <PanelProvider>
                    <LyricsOverlayProvider>
                      <AIOverlayProvider>
                        {children}
                      </AIOverlayProvider>
                    </LyricsOverlayProvider>
                  </PanelProvider>
                </PlayerProvider>
              </SidebarProvider>
            </ScrollProvider>
          </GradientHoverProvider>
        </RestrictedAppProvider>
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}