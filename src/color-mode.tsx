import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react';
import { normalPalette, colorBlindPalette } from './colors';

interface ColorModeProviderProps {
  children: ReactNode;
}

const ColorModeContext = createContext<any>(null);

export const ColorModeProvider: React.FC<ColorModeProviderProps> = ({ children }) => {
  const [isColorBlind, setIsColorBlind] = useState(false);

  const toggleColorMode = () => {
    setIsColorBlind((prev) => !prev);
  };

  const palette = isColorBlind ? colorBlindPalette : normalPalette;

    // Update CSS variables when the palette changes
    useEffect(() => {
      document.documentElement.style.setProperty('--insignificant-color', palette.insignificant);
      document.documentElement.style.setProperty('--low-color', palette.low);
      document.documentElement.style.setProperty('--medium-color', palette.medium);
      document.documentElement.style.setProperty('--high-color', palette.high);
      document.documentElement.style.setProperty('--severe-color', palette.severe);
    }, [palette]);

  return (
    <ColorModeContext.Provider value={{ isColorBlind, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  return useContext(ColorModeContext);
};