import { useWatermark } from '../../contexts/WatermarkContext';
import { ModeSelector } from './ModeSelector';
import { SinglePanel } from './SinglePanel';
import { BatchPanel } from './BatchPanel';

export function Sidebar() {
  const { state } = useWatermark();

  return (
    <aside className="bg-[var(--surface)] border-t border-[var(--border)] py-4 px-4 pb-6 overflow-y-auto flex flex-col gap-4 min-[900px]:w-[320px] min-[900px]:shrink-0 min-[900px]:border-t-0 min-[900px]:border-r min-[900px]:border-[var(--border)] min-[900px]:max-h-[calc(100vh-54px)] min-[900px]:p-5 min-[900px]:gap-5 min-[900px]:order-[-1]">
      <ModeSelector />
      {state.mode === 'single' ? <SinglePanel /> : <BatchPanel />}
    </aside>
  );
}
