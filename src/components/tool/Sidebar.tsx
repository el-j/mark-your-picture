import { useWatermark } from '../../contexts/WatermarkContext';
import { BatchPanel } from './BatchPanel';
import { ModeSelector } from './ModeSelector';
import { SinglePanel } from './SinglePanel';

export function Sidebar() {
  const { state } = useWatermark();

  return (
    <aside className="order-[-1] hidden max-h-[calc(100vh-54px)] w-[320px] shrink-0 flex-col gap-5 overflow-y-auto border-[var(--border)] border-r bg-[var(--surface)] p-5 min-[900px]:flex">
      <div className="rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--surface2)] p-4">
        <ModeSelector />
      </div>
      {state.mode === 'single' ? (
        <SinglePanel />
      ) : (
        <div className="rounded-[var(--radius)] border border-[var(--border-subtle)] bg-[var(--surface2)] p-4">
          <BatchPanel />
        </div>
      )}
    </aside>
  );
}
