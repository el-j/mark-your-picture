import { useWatermark } from '../../contexts/WatermarkContext';
import { useT } from '../../i18n/index';
import type { WatermarkPosition } from '../../lib/types';

export function PositionStyleCard() {
  const { state, dispatch } = useWatermark();
  const t = useT();
  const isFree = state.position === 'free';

  const positions: { value: WatermarkPosition; label: string }[] = [
    { value: 'free', label: t('position.free') },
    { value: 'bottom-right', label: t('position.bottomRight') },
    { value: 'bottom-left', label: t('position.bottomLeft') },
    { value: 'top-right', label: t('position.topRight') },
    { value: 'top-left', label: t('position.topLeft') },
    { value: 'center', label: t('position.center') },
    { value: 'tile', label: t('position.tile') },
  ];

  return (
    <>
      <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-3">
        {t('position.label')}
      </p>

      <label htmlFor="wm-position" className="!mt-0">
        {t('position.positionLabel')}
      </label>
      <select
        id="wm-position"
        value={state.position}
        onChange={(e) =>
          dispatch({ type: 'SET_POSITION', value: e.target.value as WatermarkPosition })
        }
      >
        {positions.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      {isFree && (
        <div className="flex items-center gap-2.5 py-2.5 px-3.5 mt-3 rounded-[var(--radius-sm)] text-[0.76rem] text-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_12%,transparent)] border border-[color-mix(in_srgb,var(--warn)_40%,transparent)]">
          <svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {t('position.freeTip')}
        </div>
      )}

      <label htmlFor="wm-opacity">{t('position.opacity')}</label>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          id="wm-opacity"
          min={5}
          max={100}
          value={state.opacity}
          onChange={(e) => dispatch({ type: 'SET_OPACITY', value: Number(e.target.value) })}
          className="flex-1"
        />
        <span className="min-w-[2.8rem] text-right text-[0.78rem] font-semibold text-[var(--text)] tabular-nums">
          {state.opacity}%
        </span>
      </div>

      <label htmlFor="wm-rotate">{t('position.rotation')}</label>
      <div className="flex items-center gap-2.5">
        <input
          type="range"
          id="wm-rotate"
          min={-180}
          max={180}
          value={state.rotation}
          onChange={(e) => dispatch({ type: 'SET_ROTATION', value: Number(e.target.value) })}
          className="flex-1"
        />
        <span className="min-w-[2.8rem] text-right text-[0.78rem] font-semibold text-[var(--text)] tabular-nums">
          {state.rotation}°
        </span>
      </div>

      {!isFree && (
        <div>
          <label htmlFor="wm-margin">{t('position.margin')}</label>
          <input
            type="number"
            id="wm-margin"
            value={state.margin}
            min={0}
            max={500}
            onChange={(e) => dispatch({ type: 'SET_MARGIN', value: Number(e.target.value) })}
          />
        </div>
      )}
    </>
  );
}
