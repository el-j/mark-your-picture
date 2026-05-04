import { useWatermark } from '../../contexts/WatermarkContext';
import { useT } from '../../i18n/index';

export function ModeSelector() {
  const { state, dispatch } = useWatermark();
  const t = useT();

  return (
    <div>
      <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-2">
        {t('mode.label')}
      </p>
      <div className="flex bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[10px] p-1 gap-1">
        {(['single', 'batch'] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => dispatch({ type: 'SET_MODE', value: mode })}
            className={`flex-1 py-2 px-3 border-none rounded-lg text-[0.8rem] font-semibold cursor-pointer transition-all duration-150 ${
              state.mode === mode
                ? 'bg-[var(--accent)] text-white shadow-[0_2px_8px_var(--accent-glow)]'
                : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface3)] hover:text-[var(--text)]'
            }`}
          >
            {mode === 'single' ? t('mode.single') : t('mode.batch')}
          </button>
        ))}
      </div>
    </div>
  );
}
