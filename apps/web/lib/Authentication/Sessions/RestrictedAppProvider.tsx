import { redirect } from 'next/navigation';
import getServerSession from './GetServerSession';
import { ReactNode } from 'react';

interface RestrictedAppProviderProps {
  children: ReactNode;
}

export default async function RestrictedAppProvider({ children }: RestrictedAppProviderProps) {
  const session = await getServerSession();
  return session?.user ? <>{children}</> : redirect("/login");
};