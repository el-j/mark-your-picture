import { WatermarkTypeCard } from './WatermarkTypeCard';
import { PositionStyleCard } from './PositionStyleCard';
import { ActionButtons } from './ActionButtons';

export function SinglePanel() {
  return (
    <div className="flex flex-col gap-4 min-[900px]:gap-5">
      <WatermarkTypeCard />
      <PositionStyleCard />
      <ActionButtons />
    </div>
  );
}
