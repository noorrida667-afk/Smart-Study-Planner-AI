import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "light" | "dark";
export type DefaultView = "cards" | "table";
export type DefaultSort = "due-asc" | "due-desc";

export interface Settings {
  emailReminders: boolean;
  studyPlanNotifications: boolean;
  defaultView: DefaultView;
  defaultSort: DefaultSort;
  theme: Theme;
}

const DEFAULTS: Settings = {
  emailReminders: true,
  studyPlanNotifications: false,
  defaultView: "cards",
  defaultSort: "due-asc",
  theme: "light",
};

const KEY = "smart-planner:settings";

interface Ctx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<Ctx | null>(null);

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    setSettings(load());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
