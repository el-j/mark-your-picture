import { useCallback, useRef, useState, useEffect } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { renderWatermark } from '../../lib/watermark';
import { useT } from '../../i18n/index';

function resolveOutputMime(sourceMime?: string): string {
  const supported = ['image/jpeg', 'image/png', 'image/webp'];
  if (sourceMime && supported.includes(sourceMime)) return sourceMime;
  return 'image/png';
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  return map[mime] ?? 'png';
}

export function ActionButtons() {
  const { state, dispatch, getRenderOpts } = useWatermark();
  const { toast } = useToast();
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === 'function');
  }, []);

  const getCanvas = useCallback((): HTMLCanvasElement | null => {
    if (canvasRef.current) return canvasRef.current;
    canvasRef.current = document.getElementById('canvas') as HTMLCanvasElement | null;
    return canvasRef.current;
  }, []);

  const getBlob = useCallback(async (): Promise<{ blob: Blob; filename: string; mime: string } | null> => {
    const canvas = getCanvas();
    if (!canvas || !state.sourceImg) return null;

    const mime = resolveOutputMime(state.sourceFile?.type);
    const ext = mimeToExt(mime);
    const baseName = (state.sourceFile?.name ?? 'watermarked').replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_watermarked.${ext}`;
    const quality = mime === 'image/jpeg' ? 0.92 : undefined;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), mime, quality);
    });

    return { blob, filename, mime };
  }, [state.sourceImg, state.sourceFile, getCanvas]);

  const handleApply = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas || !state.sourceImg) return;
    renderWatermark(canvas, state.sourceImg, getRenderOpts());
    dispatch({ type: 'SET_HAS_APPLIED', value: true });
  }, [state.sourceImg, getRenderOpts, dispatch, getCanvas]);

  // Pure download — always saves file
  const handleDownload = useCallback(async () => {
    const result = await getBlob();
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(t('actions.toastDownload'));
  }, [getBlob, toast, t]);

  // Share via Web Share API
  const handleShare = useCallback(async () => {
    const result = await getBlob();
    if (!result) return;
    const file = new File([result.blob], result.filename, { type: result.mime });
    try {
      await navigator.share({ files: [file], title: 'Watermarked Image' });
      toast(t('actions.toastShared'));
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast(t('actions.toastShareFailed'));
      }
    }
  }, [getBlob, toast, t]);

  const handleReset = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas || !state.sourceImg) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = state.sourceImg.naturalWidth;
    canvas.height = state.sourceImg.naturalHeight;
    ctx.drawImage(state.sourceImg, 0, 0);
    dispatch({ type: 'SET_HAS_APPLIED', value: false });
    toast(t('actions.toastReset'));
  }, [state.sourceImg, dispatch, getCanvas, toast, t]);

  const mime = resolveOutputMime(state.sourceFile?.type);
  const ext = mimeToExt(mime).toUpperCase();

  const btnBase = "inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-[var(--radius-sm)] text-[0.82rem] font-semibold cursor-pointer border-none transition-all tracking-tight";

  return (
    <div className="flex flex-col gap-2.5 mt-1">
      {/* Apply */}
      <button id="btn-apply" onClick={handleApply} disabled={!state.sourceImg}
        className={`${btnBase} w-full bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-glow)] hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-[0_4px_16px_var(--accent-glow)] active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        {t('actions.apply')}
      </button>

      {/* Download + Share row */}
      <div className="flex gap-2">
        <button id="btn-download" onClick={handleDownload} disabled={!state.sourceImg}
          className={`${btnBase} flex-1 bg-[var(--success)] text-white shadow-[0_2px_8px_rgba(61,220,132,0.2)] hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none`}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          {ext}
        </button>
        {canShare && (
          <button id="btn-share" onClick={handleShare} disabled={!state.sourceImg}
            className={`${btnBase} flex-1 bg-[var(--surface2)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)] active:translate-y-0 disabled:opacity-35 disabled:cursor-not-allowed disabled:transform-none`}>
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
            {t('actions.share')}
          </button>
        )}
      </div>

      {/* Reset */}
      <button id="btn-reset" onClick={handleReset}
        className={`${btnBase} w-full bg-transparent border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-glow)]`}>
        <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.54" /></svg>
        {t('actions.reset')}
      </button>
    </div>
  );
}
