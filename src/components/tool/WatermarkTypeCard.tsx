import { useWatermark } from '../../contexts/WatermarkContext';
import { TextWatermarkTab } from './TextWatermarkTab';
import { ImageWatermarkTab } from './ImageWatermarkTab';

export function WatermarkTypeCard() {
  const { state, dispatch } = useWatermark();

  return (
    <div className="bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-4">
      <p className="text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-3">Watermark Type</p>
      <div className="flex gap-1.5 mb-4">
        {(['text', 'image'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab })}
            className={`flex-1 py-2 px-2 border rounded-lg text-[0.78rem] font-semibold cursor-pointer transition-all duration-150 ${
              state.activeTab === tab
                ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-[0_2px_6px_var(--accent-glow)]'
                : 'bg-[var(--bg)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {tab === 'text' ? 'Text' : 'Image / Logo'}
          </button>
        ))}
      </div>
      {state.activeTab === 'text' ? <TextWatermarkTab /> : <ImageWatermarkTab />}
    </div>
  );
}
