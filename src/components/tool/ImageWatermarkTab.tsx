import { useRef, useCallback } from 'react';
import { useWatermark } from '../../contexts/WatermarkContext';
import { useToast } from '../../hooks/useToast';
import { loadImageFile } from '../../lib/watermark';

export function ImageWatermarkTab() {
  const { state, dispatch } = useWatermark();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const img = await loadImageFile(file);
      dispatch({ type: 'SET_WM_IMG', img });
      toast('Watermark image loaded ✓');
    } catch {
      toast('Failed to load watermark image');
    }
  }, [dispatch, toast]);

  return (
    <div className="flex flex-col gap-0.5">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-[var(--border)] rounded-[var(--radius-sm)] py-4 px-3 text-center cursor-pointer bg-[var(--bg)] transition-all duration-150 text-[0.78rem] text-[var(--text-muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-glow)]"
      >
        <svg className="mx-auto mb-1.5 opacity-50" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p>Click to select logo / image</p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLoad(file);
        }} />
        {state.wmImg && (
          <img src={state.wmImg.src} alt="Watermark preview" className="w-full max-h-[60px] object-contain mt-2 rounded-md" />
        )}
      </div>

      <label htmlFor="wm-img-scale">Scale</label>
      <div className="flex items-center gap-2.5">
        <input type="range" id="wm-img-scale" min={5} max={100} value={state.wmImgScale}
          onChange={(e) => dispatch({ type: 'SET_WM_IMG_SCALE', value: Number(e.target.value) })}
          className="flex-1" />
        <span className="min-w-[2.8rem] text-right text-[0.78rem] font-semibold text-[var(--text)] tabular-nums">{state.wmImgScale}%</span>
      </div>
    </div>
  );
}
