'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Lokaler Client-Provider (ohne Firebase).
 * Umhüllt die App mit dem lokalen Firebase-Kompat-Kontext.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
