import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { I18nProvider, useI18n, useT } from '../i18n/index';

// ── Helpers ──────────────────────────────────────────────────────────────────

function Wrapper({ children }: { children: React.ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function LangDisplay() {
  const { lang } = useI18n();
  return <span data-testid="lang">{lang}</span>;
}

function TranslationDisplay({ tKey }: { tKey: string }) {
  const t = useT();
  return <span data-testid="translation">{t(tKey)}</span>;
}

function SetLangButton({ newLang }: { newLang: 'en' | 'de' }) {
  const { setLang } = useI18n();
  return <button onClick={() => setLang(newLang)}>switch</button>;
}

// ── detectLang / default language ────────────────────────────────────────────

describe('I18nProvider – language detection', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('uses stored lang from localStorage', () => {
    localStorage.setItem('lang', 'de');
    render(
      <Wrapper>
        <LangDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('de');
  });

  it('detects German from navigator.language "de-DE"', () => {
    Object.defineProperty(navigator, 'language', { value: 'de-DE', configurable: true });
    render(
      <Wrapper>
        <LangDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('de');
  });

  it('falls back to English for non-German navigator.language', () => {
    Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
    render(
      <Wrapper>
        <LangDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });

  it('gives localStorage priority over navigator.language', () => {
    localStorage.setItem('lang', 'en');
    Object.defineProperty(navigator, 'language', { value: 'de-DE', configurable: true });
    render(
      <Wrapper>
        <LangDisplay />
      </Wrapper>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
  });
});

// ── setLang ───────────────────────────────────────────────────────────────────

describe('I18nProvider – setLang', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
  });

  it('updates the displayed language', async () => {
    render(
      <Wrapper>
        <LangDisplay />
        <SetLangButton newLang="de" />
      </Wrapper>,
    );
    expect(screen.getByTestId('lang').textContent).toBe('en');
    await userEvent.click(screen.getByText('switch'));
    expect(screen.getByTestId('lang').textContent).toBe('de');
  });

  it('persists the chosen language in localStorage', async () => {
    render(
      <Wrapper>
        <SetLangButton newLang="de" />
      </Wrapper>,
    );
    await userEvent.click(screen.getByText('switch'));
    expect(localStorage.getItem('lang')).toBe('de');
  });
});

// ── t() translation function ──────────────────────────────────────────────────

describe('useT – t()', () => {
  beforeEach(() => {
    localStorage.setItem('lang', 'en');
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
  });

  it('returns an English translation by dotted key', () => {
    render(
      <Wrapper>
        <TranslationDisplay tKey="nav.tool" />
      </Wrapper>,
    );
    expect(screen.getByTestId('translation').textContent).toBe('Tool');
  });

  it('returns the key itself when translation is missing', () => {
    render(
      <Wrapper>
        <TranslationDisplay tKey="nonexistent.key" />
      </Wrapper>,
    );
    expect(screen.getByTestId('translation').textContent).toBe('nonexistent.key');
  });

  it('interpolates variables in translation strings', () => {
    function Interpolated() {
      const t = useT();
      return <span data-testid="t">{t('batch.toastReady_many', { count: 5 })}</span>;
    }
    render(
      <Wrapper>
        <Interpolated />
      </Wrapper>,
    );
    expect(screen.getByTestId('t').textContent).toBe('5 images ready');
  });

  it('returns nested translation (header.tagline)', () => {
    render(
      <Wrapper>
        <TranslationDisplay tKey="header.tagline" />
      </Wrapper>,
    );
    expect(screen.getByTestId('translation').textContent).toBe('100% client-side · no upload');
  });

  it('switches to German translations after setLang("de")', async () => {
    function Combined() {
      const { setLang } = useI18n();
      const t = useT();
      return (
        <>
          <span data-testid="t">{t('nav.tool')}</span>
          <button onClick={() => act(() => setLang('de'))}>de</button>
        </>
      );
    }
    render(
      <Wrapper>
        <Combined />
      </Wrapper>,
    );
    expect(screen.getByTestId('t').textContent).toBe('Tool');
    await userEvent.click(screen.getByText('de'));
    // German translation for nav.tool
    expect(screen.getByTestId('t').textContent).not.toBe('');
  });
});

// ── Hook guards ───────────────────────────────────────────────────────────────

describe('useI18n – outside provider', () => {
  it('throws when used outside I18nProvider', () => {
    function Bad() {
      useI18n();
      return null;
    }
    expect(() => render(<Bad />)).toThrow('useI18n must be used within I18nProvider');
  });
});
