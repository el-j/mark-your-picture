import { useWatermark } from '../../contexts/WatermarkContext';
import { ModeSelector } from './ModeSelector';
import { SinglePanel } from './SinglePanel';
import { BatchPanel } from './BatchPanel';

export function Sidebar() {
  const { state } = useWatermark();

  return (
    <aside className="hidden min-[900px]:flex bg-[var(--surface)] overflow-y-auto flex-col w-[320px] shrink-0 border-r border-[var(--border)] max-h-[calc(100vh-54px)] p-5 gap-5 order-[-1]">
      <div className="bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-4">
        <ModeSelector />
      </div>
      {state.mode === 'single' ? <SinglePanel /> : (
        <div className="bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-4">
          <BatchPanel />
        </div>
      )}
    </aside>
  );
}
