"use client";
import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { es } from "./locales/es";
import { en } from "./locales/en";
import type { Dict } from "./locales/es";

export type Locale = "es" | "en";

const dictionaries: Record<Locale, Dict> = { es, en };

interface I18nContextValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "es",
  t: es,
  setLocale: () => {},
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("es");

  const setLocale = useCallback((l: Locale) => setLocaleState(l), []);
  const toggleLocale = useCallback(
    () => setLocaleState((prev) => (prev === "es" ? "en" : "es")),
    []
  );

  return (
    <I18nContext.Provider
      value={{ locale, t: dictionaries[locale], setLocale, toggleLocale }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
