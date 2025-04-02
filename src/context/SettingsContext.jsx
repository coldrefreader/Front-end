import { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Initialize from localStorage if available
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const stored = localStorage.getItem("animationsEnabled");
    return stored !== null ? stored === "true" : true;
  });
  const [audioMuted, setAudioMuted] = useState(() => {
    const stored = localStorage.getItem("audioMuted");
    return stored !== null ? stored === "true" : true;
  });

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem("animationsEnabled", animationsEnabled);
  }, [animationsEnabled]);

  useEffect(() => {
    localStorage.setItem("audioMuted", audioMuted);
  }, [audioMuted]);

  return (
    <SettingsContext.Provider
      value={{ animationsEnabled, setAnimationsEnabled, audioMuted, setAudioMuted }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
