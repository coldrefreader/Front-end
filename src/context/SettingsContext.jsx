import { createContext, useState } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true);

  return (
    <SettingsContext.Provider
      value={{ animationsEnabled, setAnimationsEnabled, audioMuted, setAudioMuted }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
