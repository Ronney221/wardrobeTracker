import { useWardrobeManager as useWardrobeManagerHook } from '@/src/hooks/useWardrobeManager'; // Alias to avoid name clash
import React, { createContext, ReactNode, useContext } from 'react';

// Define the shape of the context value based on the return type of useWardrobeManagerHook
// We can infer this or define it explicitly if useWardrobeManagerHook's return type is exported
// For now, let's assume we'll get it from the hook instance.

// Extracting the return type of useWardrobeManagerHook
type WardrobeManagerReturnType = ReturnType<typeof useWardrobeManagerHook>;

const WardrobeContext = createContext<WardrobeManagerReturnType | undefined>(undefined);

export const WardrobeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const wardrobeManager = useWardrobeManagerHook();
  return (
    <WardrobeContext.Provider value={wardrobeManager}>
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobeManager = (): WardrobeManagerReturnType => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error('useWardrobeManager must be used within a WardrobeProvider');
  }
  return context;
}; 