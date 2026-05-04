import { useWatermark } from '../../contexts/WatermarkContext';
import type { WatermarkPosition } from '../../lib/types';

const positions: { value: WatermarkPosition; label: string }[] = [
  { value: 'free', label: 'Free (drag on image)' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'center', label: 'Center' },
  { value: 'tile', label: 'Tile (repeat)' },
];

export function PositionStyleCard() {
  const { state, dispatch } = useWatermark();
  const isFree = state.position === 'free';

  return (
    <>
      <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-3">Position &amp; Style</p>

      <label htmlFor="wm-position" className="!mt-0">Position</label>
      <select id="wm-position" value={state.position}
        onChange={(e) => dispatch({ type: 'SET_POSITION', value: e.target.value as WatermarkPosition })}>
        {positions.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      {isFree && (
        <div className="flex items-center gap-2.5 py-2.5 px-3.5 mt-3 rounded-[var(--radius-sm)] text-[0.76rem] text-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] border border-[color-mix(in_srgb,var(--warn)_40%,transparent)]">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Tap or drag on the image to place the watermark
        </div>
      )}

      <label htmlFor="wm-opacity">Opacity</label>
      <div className="flex items-center gap-2.5">
        <input type="range" id="wm-opacity" min={5} max={100} value={state.opacity}
          onChange={(e) => dispatch({ type: 'SET_OPACITY', value: Number(e.target.value) })} className="flex-1" />
        <span className="min-w-[2.8rem] text-right text-[0.78rem] font-semibold text-[var(--text)] tabular-nums">{state.opacity}%</span>
      </div>

      <label htmlFor="wm-rotate">Rotation</label>
      <div className="flex items-center gap-2.5">
        <input type="range" id="wm-rotate" min={-180} max={180} value={state.rotation}
          onChange={(e) => dispatch({ type: 'SET_ROTATION', value: Number(e.target.value) })} className="flex-1" />
        <span className="min-w-[2.8rem] text-right text-[0.78rem] font-semibold text-[var(--text)] tabular-nums">{state.rotation}°</span>
      </div>

      {!isFree && (
        <div>
          <label htmlFor="wm-margin">Margin (px)</label>
          <input type="number" id="wm-margin" value={state.margin} min={0} max={500}
            onChange={(e) => dispatch({ type: 'SET_MARGIN', value: Number(e.target.value) })} />
        </div>
      )}
    </>
  );
}
