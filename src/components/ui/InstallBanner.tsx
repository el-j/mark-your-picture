import { useEffect, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';

const BANNER_DELAY_MS = 3000;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();
  const t = useT();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (sessionStorage.getItem('pwa-dismissed') !== '1') {
        setTimeout(() => setVisible(true), BANNER_DELAY_MS);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
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
    sessionStorage.setItem('pwa-dismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed right-0 bottom-20 left-0 z-50 flex justify-center px-4 md:bottom-6">
      <div className="flex w-full max-w-sm items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-lg)]">
        <div className="flex-1 text-[0.82rem] text-[var(--text)]">
          <strong className="mb-0.5 block text-[var(--text)]">{t('install.title')}</strong>
          {t('install.subtitle')}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="cursor-pointer rounded-[var(--radius-sm)] border-none bg-[var(--accent)] px-3 py-1.5 font-semibold text-[0.78rem] text-white hover:bg-[var(--accent-hover)]"
          >
            {t('install.install')}
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
