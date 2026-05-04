import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';

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
        setTimeout(() => setVisible(true), 3000);
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
      toast(t('pwa.toastInstalled'));
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
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 md:bottom-6">
      <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] py-3 px-4 shadow-[var(--shadow-lg)] max-w-sm w-full">
        <div className="flex-1 text-[0.82rem] text-[var(--text)]">
          <strong className="block text-[var(--text)] mb-0.5">{t('pwa.title')}</strong>
          {t('pwa.desc')}
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleInstall}
            className="py-1.5 px-3 text-[0.78rem] font-semibold bg-[var(--accent)] text-white border-none rounded-[var(--radius-sm)] cursor-pointer hover:bg-[var(--accent-hover)]">
            {t('pwa.install')}
          </button>
          <button onClick={handleDismiss}
            className="py-1.5 px-2 text-[0.78rem] bg-transparent text-[var(--text-muted)] border border-[var(--border)] rounded-[var(--radius-sm)] cursor-pointer hover:text-[var(--text)]">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
