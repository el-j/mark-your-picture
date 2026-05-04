import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../hooks/useToast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (sessionStorage.getItem('pwa-dismissed') !== '1') {
        setTimeout(() => setVisible(true), 3000);
      }
    };
    const installedHandler = () => {
      setVisible(false);
      setDeferredPrompt(null);
      toast('App installed! Launch it from your home screen ✓', 4000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [toast]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setVisible(false);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') toast('App installed ✓', 3000);
    setDeferredPrompt(null);
  }, [deferredPrompt, toast]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    sessionStorage.setItem('pwa-dismissed', '1');
  }, []);

  if (!visible) return null;

  return (
    <div
      id="install-banner"
      role="complementary"
      aria-label="Install app"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--accent)] rounded-[var(--radius)] p-3 px-4 shadow-[var(--shadow)] z-[99] flex items-center gap-2.5 max-w-[calc(100vw-2rem)] animate-[slideUp_0.3s_ease]"
    >
      <img className="shrink-0 rounded-[10px]" src="./icons/icon-72x72.png" width="40" height="40" alt="App icon" />
      <div className="flex-1 min-w-0">
        <strong className="block text-[0.85rem]">Install Mark Your Picture</strong>
        <span className="text-[0.72rem] text-[var(--text-muted)]">Works offline · fast · no uploads</span>
      </div>
      <button onClick={handleInstall} className="bg-[var(--accent)] text-white border-none rounded-[var(--radius-sm)] px-3 py-1.5 text-[0.8rem] font-semibold cursor-pointer whitespace-nowrap shrink-0 hover:bg-[var(--accent-hover)]">Install</button>
      <button onClick={handleDismiss} aria-label="Dismiss" className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-base leading-none p-0.5 shrink-0 hover:text-[var(--text)]">✕</button>
    </div>
  );
}
