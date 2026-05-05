import { useCallback, useRef } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { useT } from '../../i18n/index';
import { loadImageFile } from '../../lib/watermark';

export function ImageWatermarkTab() {
  const { state, dispatch } = useWatermark();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const img = await loadImageFile(file);
        dispatch({ type: 'SET_WM_IMG', img });
        toast(t('imageTab.toastLoaded'));
      } catch {
        toast(t('imageTab.toastError'));
      }
    },
    [dispatch, toast, t],
  );

  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor="wm-img-input"
        className="block cursor-pointer rounded-[var(--radius-sm)] border-2 border-[var(--border)] border-dashed bg-[var(--bg)] px-3 py-4 text-center text-[0.78rem] text-[var(--text-muted)] transition-all duration-150 hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
      >
        <svg
          aria-hidden="true"
          className="mx-auto mb-1.5 opacity-50"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>{t('imageTab.clickToSelect')}</p>
        <input
          ref={fileInputRef}
          type="file"
          id="wm-img-input"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleLoad(file);
          }}
        />
        {state.wmImg && (
          <img
            src={state.wmImg.src}
            alt="Watermark preview"
            className="mt-2 max-h-[60px] w-full rounded-md object-contain"
          />
        )}
      </label>

      <label htmlFor="wm-img-scale">{t('imageTab.scale')}</label>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          id="wm-img-scale"
          min={5}
          max={100}
          value={state.wmImgScale}
          onChange={(e) => dispatch({ type: 'SET_WM_IMG_SCALE', value: Number(e.target.value) })}
          className="flex-1"
        />
        <span className="min-w-[2.8rem] text-right font-semibold text-[0.78rem] text-[var(--text)] tabular-nums">
          {state.wmImgScale}%
        </span>
      </div>
    </div>
  );
}
