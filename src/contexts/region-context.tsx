
'use client';

import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';
import type { Region } from '@/lib/types';

interface RegionContextType {
  region: Region;
  setRegion: (region: Region) => void;
  currency: 'EUR' | 'CHF';
  locale: 'de-DE' | 'de-AT' | 'de-CH';
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [region, setRegion] = useState<Region>('DE');

  const contextValue = useMemo(() => {
    const currency: 'EUR' | 'CHF' = region === 'CH' ? 'CHF' : 'EUR';
    const locale: 'de-DE' | 'de-AT' | 'de-CH' = region === 'AT' ? 'de-AT' : region === 'CH' ? 'de-CH' : 'de-DE';
    return { region, setRegion, currency, locale };
  }, [region]);

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
