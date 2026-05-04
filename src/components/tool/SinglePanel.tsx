import { ActionButtons } from './ActionButtons';
import { PositionStyleCard } from './PositionStyleCard';
import { WatermarkTypeCard } from './WatermarkTypeCard';

export function SinglePanel() {
  const cardCls =
    'bg-[var(--surface2)] border border-[var(--border-subtle)] rounded-[var(--radius)] p-4';

  return (
    <div className="flex flex-col gap-4 min-[900px]:gap-5">
      <div className={cardCls}>
        <WatermarkTypeCard />
      </div>
      <div className={cardCls}>
        <PositionStyleCard />
      </div>
      <ActionButtons />
    </div>
  );
}
