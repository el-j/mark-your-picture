import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { en, type Translations } from './locales/en';
import { de } from './locales/de';

export type Lang = 'en' | 'de';

const locales: Record<Lang, Translations> = { en, de };

function detectLang(): Lang {
  const stored = localStorage.getItem('lang') as Lang | null;
  if (stored === 'en' || stored === 'de') return stored;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  return browser === 'de' ? 'de' : 'en';
}

type TFunc = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunc;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function getByPath(obj: unknown, path: string): string {
  const result = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
  return typeof result === 'string' ? result : path;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem('lang', next);
    setLangState(next);
  }, []);

  const t: TFunc = useCallback((key: string, vars?: Record<string, string | number>) => {
    const raw = getByPath(locales[lang], key);
    if (!vars) return raw;
    // Replaces `{variableName}` placeholders in translation strings, e.g. t('batch.toastReady_many', { count: 5 })
    return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
  }, [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function useT() {
  return useI18n().t;
}
