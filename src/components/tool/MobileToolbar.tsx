import { useT } from '../../i18n/index';

export type MobilePanelType = 'mode' | 'watermark' | 'position' | 'export' | null;

interface MobileToolbarProps {
  activePanel: MobilePanelType;
  onOpenPanel: (panel: MobilePanelType) => void;
}

export function MobileToolbar({ activePanel, onOpenPanel }: MobileToolbarProps) {
  const t = useT();
  const btnBase =
    'flex flex-col items-center justify-center flex-1 h-full gap-1 border-none bg-transparent cursor-pointer transition-colors duration-200';
  const getBtnCls = (panel: MobilePanelType) =>
    `${btnBase} ${activePanel === panel ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface2)] hover:text-[var(--text)]'}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[64px] bg-[var(--surface)] border-t border-[var(--border)] z-50 flex items-center px-1 min-[900px]:hidden pb-[env(safe-area-inset-bottom)]">
      {/* Mode Button */}
      <button type="button" className={getBtnCls('mode')} onClick={() => onOpenPanel('mode')}>
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span className="text-[0.65rem] font-medium">{t('toolbar.mode')}</span>
      </button>

      {/* Watermark Button */}
      <button
        type="button"
        className={getBtnCls('watermark')}
        onClick={() => onOpenPanel('watermark')}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        <span className="text-[0.65rem] font-medium">{t('toolbar.watermark')}</span>
      </button>

      {/* Position & Style Button */}
      <button
        type="button"
        className={getBtnCls('position')}
        onClick={() => onOpenPanel('position')}
      >
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <span className="text-[0.65rem] font-medium">{t('toolbar.position')}</span>
      </button>

      {/* Export/Actions Button */}
      <button type="button" className={getBtnCls('export')} onClick={() => onOpenPanel('export')}>
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-[0.65rem] font-medium">{t('toolbar.export')}</span>
      </button>
    </div>
  );
}
