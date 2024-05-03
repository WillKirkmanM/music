import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { PlayerProvider } from '../Music/Player/usePlayer';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <PlayerProvider>
        {children}
      </PlayerProvider>
    </ThemeProvider>
  );
}