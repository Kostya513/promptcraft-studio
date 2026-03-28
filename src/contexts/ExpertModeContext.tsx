import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type ModeType = "simple" | "expert";

export interface ExpertSettings {
  temperature: number;
  maxTokens: number;
  detailLevel: number;
  creativity: number;
  format: "text" | "code" | "json" | "markdown";
}

interface ExpertModeContextType {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  settings: ExpertSettings;
  updateSettings: (settings: Partial<ExpertSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ExpertSettings = {
  temperature: 0.7,
  maxTokens: 1000,
  detailLevel: 8,
  creativity: 0.8,
  format: "text",
};

const ExpertModeContext = createContext<ExpertModeContextType | undefined>(undefined);

export function ExpertModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ModeType>(() => {
    const saved = localStorage.getItem("promptcraft_mode");
    return (saved as ModeType) || "simple";
  });

  const [settings, setSettings] = useState<ExpertSettings>(() => {
    const saved = localStorage.getItem("promptcraft_expert_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem("promptcraft_mode", mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem("promptcraft_expert_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<ExpertSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <ExpertModeContext.Provider value={{ mode, setMode, settings, updateSettings, resetSettings }}>
      {children}
    </ExpertModeContext.Provider>
  );
}

export function useExpertMode() {
  const context = useContext(ExpertModeContext);
  if (!context) throw new Error("useExpertMode must be used within ExpertModeProvider");
  return context;
}