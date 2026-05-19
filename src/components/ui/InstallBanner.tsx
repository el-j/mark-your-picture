import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';

const BANNER_DELAY_MS = 3000;
const DISMISS_UNTIL_KEY = 'pwa-dismissed-until';
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

const getDismissedUntil = (): number => {
  const raw = localStorage.getItem(DISMISS_UNTIL_KEY);
  return raw ? Number(raw) : 0;
};

const isDismissed = (): boolean => {
  const until = getDismissedUntil();
  return Number.isFinite(until) && until > Date.now();
};

const markDismissed = () => {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_UNTIL_KEY, String(until));
};

const isStandalone = (): boolean => {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
};

const isIosSafari = (): boolean => {
  const ua = window.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
};

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosFallback, setIosFallback] = useState(false);
  const { toast } = useToast();
  const t = useT();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed()) {
        setTimeout(() => setVisible(true), BANNER_DELAY_MS);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (isStandalone() || isDismissed() || !isIosSafari()) return;
    setIosFallback(true);
    const timer = setTimeout(() => setVisible(true), BANNER_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (iosFallback) {
      toast(t('install.iosToast'));
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      toast(t('install.toastInstalled'));
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    markDismissed();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed right-0 bottom-20 left-0 z-50 flex justify-center px-4 md:bottom-6">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lg)]">
        <div className="flex-1 text-[0.82rem] text-[var(--text)]">
          <strong className="mb-0.5 block text-[var(--text)]">{t('install.title')}</strong>
          {iosFallback ? t('install.iosSubtitle') : t('install.subtitle')}
          {iosFallback && (
            <p className="mt-1 text-[0.72rem] text-[var(--text-muted)]">{t('install.iosSteps')}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--accent)] px-3 py-1.5 font-semibold text-[0.78rem] text-white hover:bg-[var(--accent-hover)]"
          >
            {iosFallback ? t('install.iosAction') : t('install.install')}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="cursor-pointer rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent px-2 py-1.5 text-[0.78rem] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
