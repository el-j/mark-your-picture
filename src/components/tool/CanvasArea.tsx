import { useWatermark } from '../../contexts/WatermarkContext';
import { DropZone } from './DropZone';
import { WatermarkCanvas } from './WatermarkCanvas';

export function CanvasArea() {
  const { state, dispatch } = useWatermark();

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center relative overflow-auto p-4 max-[899px]:pb-[calc(64px+1rem)]"
      style={{
        background: `repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%) 0 0 / 20px 20px`,
      }}
    >
      {!state.sourceImg ? (
        <DropZone />
      ) : (
        <>
          <WatermarkCanvas />
          <button
            type="button"
            onClick={() => dispatch({ type: 'CLEAR_SOURCE' })}
            className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] rounded-[var(--radius-sm)] shadow-[var(--shadow-sm)] text-[var(--text)] text-[0.75rem] font-semibold hover:bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer z-10"
          >
            <svg
              aria-hidden="true"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Image
          </button>
        </>
      )}
    </section>
  );
}
