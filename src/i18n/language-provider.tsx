"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultLocale, localeCookieName, localeStorageKey, locales, type Locale } from "./config";
import { defaultMessages, getMessages, type Messages } from "./messages";
import { translate } from "./translate";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLocale?: Locale;
};

export function LanguageProvider({ children, initialLocale = defaultLocale }: LanguageProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      setLocaleState(nextLocale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = nextLocale;
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000`;
        localStorage.setItem(localeStorageKey, nextLocale);
      }
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const stored = localStorage.getItem(localeStorageKey) as Locale | null;
    if (stored && locales.includes(stored) && stored !== locale) {
      setLocaleState(stored);
      document.cookie = `${localeCookieName}=${stored}; path=/; max-age=31536000`;
      document.documentElement.lang = stored;
      router.refresh();
    }
  }, [locale, router]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(messages, key, vars, defaultMessages),
    [messages]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages,
      t,
    }),
    [locale, messages, setLocale, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslations() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslations must be used within LanguageProvider");
  }
  return context;
}
