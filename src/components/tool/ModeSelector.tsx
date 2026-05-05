import { useWatermark } from '../../contexts/WatermarkContext';
import { useT } from '../../i18n/index';

export function ModeSelector() {
  const { state, dispatch } = useWatermark();
  const t = useT();

  return (
    <div>
      <p className="mb-2 font-bold text-[0.65rem] text-[var(--text-muted)] uppercase tracking-[0.1em]">
        {t('mode.label')}
      </p>
      <div className="flex gap-1 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--surface2)] p-1">
        {(['single', 'batch'] as const).map((mode) => (
          <button
            type="button"
            key={mode}
            onClick={() => dispatch({ type: 'SET_MODE', value: mode })}
            className={`flex-1 cursor-pointer rounded-lg border-none px-3 py-2 font-semibold text-[0.8rem] transition-all duration-150 ${
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
