import { useWatermark } from '../../contexts/WatermarkContext';
import { useT } from '../../i18n/index';
import { ImageWatermarkTab } from './ImageWatermarkTab';
import { TextWatermarkTab } from './TextWatermarkTab';

export function WatermarkTypeCard() {
  const { state, dispatch } = useWatermark();
  const t = useT();

  return (
    <>
      <p className="mb-3 font-bold text-[0.65rem] text-[var(--text-muted)] uppercase tracking-[0.1em]">
        {t('watermark.typeLabel')}
      </p>
      <div className="mb-4 flex gap-1.5">
        {(['text', 'image'] as const).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
            className={`flex-1 cursor-pointer rounded-lg border px-2 py-2 font-semibold text-[0.78rem] transition-all duration-150 ${
              state.activeTab === tab
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_2px_6px_var(--accent-glow)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {tab === 'text' ? t('watermark.text') : t('watermark.imageTab')}
          </button>
        ))}
      </div>
      {state.activeTab === 'text' ? <TextWatermarkTab /> : <ImageWatermarkTab />}
    </>
  );
}
