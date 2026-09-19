import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { storage } from "@/src/utils/storage";
import es from "@/src/i18n/es.json";
import pt from "@/src/i18n/pt.json";

export type Lang = "es" | "pt";
type Dict = Record<string, string>;

const DICTS: Record<Lang, Dict> = { es: es as Dict, pt: pt as Dict };
const LANG_KEY = "refsync_lang";

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  const dict = DICTS[lang] ?? DICTS.es;
  return interpolate(dict[key] ?? key, params);
}

// Module-level current language + singleton t(), for non-component code
// (e.g. building notices inside the match context).
export let currentLang: Lang = "es";
export function t(key: string, params?: Record<string, string | number>): string {
  return translate(currentLang, key, params);
}

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<Lang>(LANG_KEY, "es");
      const value: Lang = saved === "pt" ? "pt" : "es";
      currentLang = value;
      setLangState(value);
    })();
  }, []);

  const setLang = useCallback((l: Lang) => {
    currentLang = l;
    setLangState(l);
    storage.setItem(LANG_KEY, l);
  }, []);

  const boundT = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t: boundT }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
